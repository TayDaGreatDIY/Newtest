import OpenAI from 'openai';
import { supabase } from './supabaseClient';
import type { AICoachPreferences } from '../types/db';

// Constants
const POSTGRES_NO_ROWS_ERROR = 'PGRST116';

// ⚠️ SECURITY WARNING: Development Only Configuration ⚠️
// This configuration exposes the OpenAI API key in the browser.
// For production deployments, this MUST be replaced with one of:
// 1. A Supabase Edge Function that calls OpenAI server-side
// 2. A separate backend API endpoint that proxies OpenAI requests
// 3. A serverless function (AWS Lambda, Vercel Functions, etc.)
//
// The dangerouslyAllowBrowser option should NEVER be used in production.
// Exposed API keys can be extracted and abused, leading to unauthorized charges.
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // ⚠️ DEVELOPMENT ONLY - See warning above
});

// System prompt for the basketball coach
const COACH_SYSTEM_PROMPT = `You are an expert basketball coach, personal trainer, and motivational mentor with years of experience helping athletes reach their peak performance. Your role is to:

**As a Motivational Coach:**
- Provide personalized encouragement and support tailored to each athlete's journey
- Celebrate progress, no matter how small
- Help athletes overcome mental barriers and self-doubt
- Share inspiring stories and perspectives to fuel their drive
- Keep them accountable while being compassionate

**As a Workout Planner:**
- Design customized basketball training plans based on the user's specific goals (e.g., improving shooting, speed, vertical jump, endurance)
- Adjust workout intensity and volume based on their fitness level and available time
- Incorporate proper warm-ups, skill work, conditioning, and recovery
- Provide progressive overload strategies to ensure continuous improvement
- Consider injury prevention in all training recommendations

**As a Nutrition Guide:**
- Create personalized meal plans aligned with their performance goals (muscle gain, fat loss, maintenance, energy)
- Recommend pre-workout and post-workout nutrition for optimal performance and recovery
- Suggest hydration strategies for training and game days
- Provide healthy eating tips that fit their lifestyle and budget
- Address specific dietary needs or preferences

**As a Mental Coach:**
- Teach visualization techniques for game situations
- Guide them through breathing exercises and mindfulness practices
- Help develop pre-game routines and mental preparation strategies
- Provide tools for managing pressure and anxiety
- Build mental toughness and resilience

**Important Guidelines:**
- ALWAYS remember and reference information the user shares about themselves (goals, preferences, challenges, progress)
- Ask clarifying questions to better understand their needs before giving generic advice
- Adapt your responses based on their previous messages and stated goals
- Keep responses conversational, warm, and supportive (2-4 paragraphs)
- Use emojis naturally to maintain an engaging, friendly tone
- Be specific and actionable in your recommendations
- Track their journey: reference past conversations, celebrate milestones, and note improvements

Remember: You're not just giving advice; you're building a relationship with each athlete to help them become the best version of themselves. Learn from every interaction to provide increasingly personalized guidance.`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Get a response from the AI coach
 */
export async function getCoachResponse(
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
  userId?: string
): Promise<{ response: string; error: string | null }> {
  try {
    // Check if API key is configured
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return {
        response: '',
        error: 'OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file.',
      };
    }

    // Get user preferences if userId is provided
    let userContext = '';
    if (userId) {
      const preferences = await getUserPreferences(userId);
      if (preferences) {
        userContext = buildUserContext(preferences);
      }
    }

    // Build messages array with user context
    const systemPrompt = userContext 
      ? `${COACH_SYSTEM_PROMPT}\n\n${userContext}`
      : COACH_SYSTEM_PROMPT;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    if (!response) {
      throw new Error('No response from AI');
    }

    // Save conversation to database if userId is provided
    if (userId) {
      await saveConversation(userId, 'user', userMessage);
      await saveConversation(userId, 'assistant', response);
    }

    return { response, error: null };
  } catch (error) {
    console.error('Error getting AI coach response:', error);
    
    let errorMessage = 'Failed to get response from AI coach.';
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'Invalid OpenAI API key. Please check your .env configuration.';
      } else if (error.message.includes('quota') || error.message.includes('billing')) {
        errorMessage = 'OpenAI API quota exceeded. Please check your billing settings.';
      } else if (error.message.includes('rate')) {
        errorMessage = 'Rate limit reached. Please try again in a moment.';
      } else {
        errorMessage = error.message;
      }
    }

    return { response: '', error: errorMessage };
  }
}
/**
 * Get a quick motivational response (fallback when API is not available)
 */
export function getFallbackResponse(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('motivation')) {
    return '🔥 You\'ve got this! Remember, every champion was once a contender who refused to give up. Your dedication today builds the success of tomorrow. Let\'s make today count! 💪';
  } else if (lowerPrompt.includes('workout') || lowerPrompt.includes('training')) {
    return '🏀 Here\'s a great workout plan:\n\n1. Warm-up: 10 mins dynamic stretching\n2. Ball handling drills: 15 mins\n3. Shooting practice: 20 mins (focus on form)\n4. Defensive slides: 10 mins\n5. 3-point practice: 15 mins\n6. Cool down: 5 mins stretching\n\nRemember to stay hydrated! 💧';
  } else if (lowerPrompt.includes('nutrition') || lowerPrompt.includes('eat')) {
    return '🥗 For optimal performance, focus on:\n\n• Lean proteins (chicken, fish, tofu)\n• Complex carbs (brown rice, quinoa, sweet potatoes)\n• Healthy fats (avocado, nuts, olive oil)\n• Plenty of fruits and vegetables\n• Stay hydrated with water!\n\nEat 2-3 hours before training for best results. 💪';
  } else if (lowerPrompt.includes('mental') || lowerPrompt.includes('mindset')) {
    return '🧠 Mental preparation is key! Try these techniques:\n\n1. Visualization: Picture yourself succeeding\n2. Deep breathing: 4-7-8 technique\n3. Positive affirmations: "I am prepared and capable"\n4. Focus on process, not outcome\n5. Stay present in the moment\n\nYou\'re mentally stronger than you think! 🌟';
  } else {
    return 'That\'s a great question! I\'m here to help with training, motivation, nutrition, and mental preparation. Try using one of the quick prompts, or ask me anything specific about your basketball journey! 🏀';
  }
}

/**
 * Get user preferences from database
 */
export async function getUserPreferences(userId: string): Promise<AICoachPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('ai_coach_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === POSTGRES_NO_ROWS_ERROR) {
        // No preferences found - that's ok
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
}

/**
 * Update or create user preferences
 */
export async function updateUserPreferences(
  userId: string,
  preferences: Partial<AICoachPreferences>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('ai_coach_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
      });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update preferences' };
  }
}

/**
 * Save conversation message to database
 */
async function saveConversation(
  userId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  try {
    await supabase
      .from('ai_coach_conversations')
      .insert({
        user_id: userId,
        message_role: role,
        message_content: content,
      });
  } catch (error) {
    console.error('Error saving conversation:', error);
    // Don't throw - this is a non-critical operation
  }
}

/**
 * Get recent conversation history from database
 */
export async function getConversationHistory(
  userId: string,
  limit: number = 10
): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('ai_coach_conversations')
      .select('message_role, message_content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Reverse to get chronological order and map to ChatMessage format
    return (data || [])
      .reverse()
      .map(msg => ({
        role: msg.message_role as 'user' | 'assistant',
        content: msg.message_content,
      }));
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return [];
  }
}

/**
 * Build user context string from preferences
 */
function buildUserContext(preferences: AICoachPreferences): string {
  const contextParts: string[] = ['**User Profile:**'];

  if (preferences.primary_goal) {
    contextParts.push(`- Primary Goal: ${preferences.primary_goal}`);
  }
  if (preferences.fitness_level) {
    contextParts.push(`- Fitness Level: ${preferences.fitness_level}`);
  }
  if (preferences.training_days_per_week) {
    contextParts.push(`- Training Frequency: ${preferences.training_days_per_week} days per week`);
  }
  if (preferences.available_equipment) {
    contextParts.push(`- Available Equipment: ${preferences.available_equipment}`);
  }
  if (preferences.shooting_goal) {
    contextParts.push(`- Shooting Goal: ${preferences.shooting_goal}`);
  }
  if (preferences.defense_goal) {
    contextParts.push(`- Defense Goal: ${preferences.defense_goal}`);
  }
  if (preferences.conditioning_goal) {
    contextParts.push(`- Conditioning Goal: ${preferences.conditioning_goal}`);
  }
  if (preferences.nutrition_goal) {
    contextParts.push(`- Nutrition Goal: ${preferences.nutrition_goal}`);
  }
  if (preferences.dietary_restrictions) {
    contextParts.push(`- Dietary Restrictions: ${preferences.dietary_restrictions}`);
  }
  if (preferences.mental_focus_areas) {
    contextParts.push(`- Mental Focus: ${preferences.mental_focus_areas}`);
  }
  if (preferences.injuries_or_limitations) {
    contextParts.push(`- Injuries/Limitations: ${preferences.injuries_or_limitations}`);
  }
  if (preferences.notes) {
    contextParts.push(`- Additional Notes: ${preferences.notes}`);
  }

  return contextParts.length > 1 ? contextParts.join('\n') : '';
}
