import OpenAI from 'openai';

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
const COACH_SYSTEM_PROMPT = `You are an expert basketball coach and trainer with years of experience helping players improve their game. You provide:

- Motivational support and encouragement
- Training and workout plans tailored to basketball
- Nutrition advice for athletes
- Mental preparation and mindset coaching
- Technical skill development tips
- Injury prevention and recovery advice

Keep your responses concise (2-3 paragraphs max), friendly, and actionable. Use emojis occasionally to make the conversation engaging. Always be positive and supportive while providing practical, expert advice.`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Get a response from the AI coach
 */
export async function getCoachResponse(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
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

    // Build messages array
    const messages: ChatMessage[] = [
      { role: 'system', content: COACH_SYSTEM_PROMPT },
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
