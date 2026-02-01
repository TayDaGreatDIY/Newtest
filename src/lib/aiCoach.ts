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
 * Check if OpenAI API is available
 */
export function isOpenAIConfigured(): boolean {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  return !!(apiKey && apiKey.trim() !== '');
}

/**
 * Get a response from the AI coach
 */
export async function getCoachResponse(
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
  userId?: string
): Promise<{ response: string; error: string | null; usingFallback: boolean }> {
  try {
    // Check if API key is configured
    if (!isOpenAIConfigured()) {
      // Use fallback responses without showing an error
      const fallbackResponse = getFallbackResponse(userMessage);
      return {
        response: fallbackResponse,
        error: null,
        usingFallback: true,
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

    return { response, error: null, usingFallback: false };
  } catch (error) {
    console.error('Error getting AI coach response:', error);
    
    let errorMessage = 'Failed to get response from AI coach.';
    let shouldUseFallback = false;
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'Invalid OpenAI API key. Please check your .env configuration.';
        shouldUseFallback = true;
      } else if (error.message.includes('quota') || error.message.includes('billing')) {
        errorMessage = 'OpenAI API quota exceeded. Using basic coach responses.';
        shouldUseFallback = true;
      } else if (error.message.includes('rate')) {
        errorMessage = 'Rate limit reached. Using basic coach responses temporarily.';
        shouldUseFallback = true;
      } else {
        errorMessage = error.message;
        shouldUseFallback = true;
      }
    }

    // If we should use fallback, return fallback response instead of empty
    if (shouldUseFallback) {
      const fallbackResponse = getFallbackResponse(userMessage);
      return { response: fallbackResponse, error: errorMessage, usingFallback: true };
    }

    return { response: '', error: errorMessage, usingFallback: false };
  }
}
/**
 * Get a quick motivational response (fallback when API is not available)
 */
export function getFallbackResponse(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('motivation') || lowerPrompt.includes('inspire') || lowerPrompt.includes('encourage')) {
    return '🔥 You\'ve got this! Remember, every champion was once a contender who refused to give up. Your dedication today builds the success of tomorrow. Let\'s make today count! 💪\n\nThe path to greatness is built one day at a time. Stay focused, stay hungry, and never stop believing in yourself. You\'re stronger than you know! 🌟';
  } else if (lowerPrompt.includes('workout') || lowerPrompt.includes('training') || lowerPrompt.includes('practice')) {
    return '🏀 Here\'s a great basketball workout plan:\n\n**Warm-up (10 mins):**\n• Dynamic stretching and light jogging\n• Arm circles and leg swings\n\n**Skill Work (35 mins):**\n• Ball handling drills: 15 mins\n• Shooting practice: 20 mins (focus on form)\n  - Form shooting close to basket\n  - Mid-range jumpers\n  - Three-point practice\n\n**Conditioning (15 mins):**\n• Defensive slides: 5 mins\n• Sprint drills: 5 mins\n• Jump rope: 5 mins\n\n**Cool down (5 mins):**\n• Static stretching\n• Deep breathing\n\nRemember to stay hydrated throughout! 💧';
  } else if (lowerPrompt.includes('nutrition') || lowerPrompt.includes('eat') || lowerPrompt.includes('food') || lowerPrompt.includes('diet')) {
    return '🥗 Optimal nutrition for basketball performance:\n\n**Pre-Workout (2-3 hours before):**\n• Complex carbs: brown rice, oatmeal, sweet potatoes\n• Lean protein: chicken, fish, eggs\n• Hydration: 16-20oz water\n\n**Post-Workout (within 30-60 mins):**\n• Protein shake or chocolate milk\n• Banana with nut butter\n• Recovery meal with protein + carbs\n\n**Daily Nutrition Focus:**\n• Lean proteins (chicken, fish, tofu, legumes)\n• Complex carbs (quinoa, brown rice, whole grains)\n• Healthy fats (avocado, nuts, olive oil)\n• Plenty of colorful fruits and vegetables\n• 8-10 glasses of water daily\n\n**Game Day:** Eat light 3-4 hours before, stay hydrated! 💪';
  } else if (lowerPrompt.includes('mental') || lowerPrompt.includes('mindset') || lowerPrompt.includes('focus') || lowerPrompt.includes('confidence')) {
    return '🧠 Mental preparation techniques for peak performance:\n\n**Visualization (5-10 mins daily):**\n• Close your eyes and picture yourself succeeding\n• See every detail: the court, the ball, your movements\n• Feel the confidence and success\n\n**Breathing Exercises:**\n• 4-7-8 Technique: Breathe in for 4, hold for 7, exhale for 8\n• Use before games or when feeling anxious\n\n**Positive Affirmations:**\n• "I am prepared and capable"\n• "I trust my training and abilities"\n• "I perform best under pressure"\n\n**Pre-Game Routine:**\n• Create a consistent warm-up routine\n• Focus on the process, not the outcome\n• Stay present in each moment\n\n**Remember:** Mental toughness is built through practice, just like physical skills. You\'re stronger than you think! 🌟';
  } else if (lowerPrompt.includes('shooting') || lowerPrompt.includes('shot')) {
    return '🎯 Shooting improvement tips:\n\n**Form Fundamentals:**\n• BEEF: Balance, Eyes, Elbow, Follow-through\n• Square your feet to the basket\n• Keep elbow tucked in\n• Release at the peak of your jump\n• Follow through with a "gooseneck" wrist\n\n**Practice Drills:**\n• Form shooting (5 feet from basket): 25 makes\n• Spot shooting from 5 spots: 10 makes each\n• Free throws: 25 makes daily\n• Game-speed shooting with movement\n\n**Mental Approach:**\n• Same routine every time\n• See the ball going in before you shoot\n• Confidence is key - trust your shot!\n\nConsistency comes from repetition. Keep shooting! 🏀';
  } else if (lowerPrompt.includes('defense') || lowerPrompt.includes('defensive')) {
    return '🛡️ Defensive excellence tips:\n\n**Stance and Positioning:**\n• Low, wide stance\n• Hands active and up\n• Stay on balls of your feet\n• Keep eyes on opponent\'s hips\n\n**Key Principles:**\n• Anticipate, don\'t react\n• Contest every shot\n• Communicate with teammates\n• Control the driving lanes\n\n**Drills:**\n• Defensive slides: 3 sets of 1 minute\n• Closeout drills\n• 1-on-1 full court\n• Shell drill for team defense\n\n**Mindset:**\n• Take pride in your defense\n• Every possession matters\n• Be the player others don\'t want to face!\n\nDefense wins championships! 💪';
  } else if (lowerPrompt.includes('vertical') || lowerPrompt.includes('jump') || lowerPrompt.includes('dunk')) {
    return '⬆️ Vertical jump training program:\n\n**Plyometric Exercises (3x per week):**\n• Box jumps: 3 sets of 8-10\n• Depth jumps: 3 sets of 6-8\n• Broad jumps: 3 sets of 8\n• Single-leg hops: 3 sets of 10 each leg\n\n**Strength Training:**\n• Squats: 4 sets of 6-8 reps\n• Deadlifts: 3 sets of 6-8\n• Lunges: 3 sets of 10 each leg\n• Calf raises: 4 sets of 15\n\n**Important Notes:**\n• Rest 48 hours between plyometric sessions\n• Focus on explosive, quick movements\n• Land softly to prevent injury\n• Combine with proper nutrition and sleep\n\nProgress takes time - stay consistent! 🚀';
  } else if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
    return 'Hey there! 👋 Great to see you! I\'m your basketball coach, here to help you level up your game. Whether you need workout plans, nutrition advice, mental coaching, or just some motivation, I\'ve got you covered!\n\nWhat would you like to work on today? Try asking me about:\n• Training workouts\n• Shooting form\n• Nutrition tips\n• Mental preparation\n• Defense techniques\n• Or anything else basketball-related!\n\nLet\'s get to work! 💪🏀';
  } else {
    return 'Great question! 🏀 I\'m here to help you with all aspects of your basketball journey:\n\n💪 **Training & Workouts:** Custom plans for your goals\n🎯 **Skill Development:** Shooting, ball handling, defense\n🥗 **Nutrition:** Meal plans and performance fueling\n🧠 **Mental Game:** Confidence, focus, and mindset\n⬆️ **Athletic Performance:** Vertical jump, speed, agility\n\nTry one of the quick prompts above, or ask me anything specific about your basketball training. I\'m here to help you become the best player you can be!\n\nWhat aspect would you like to work on today? 🌟';
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
