import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard, SectionHeader, GradientButton } from '../components';
import { getCoachResponse, getFallbackResponse, getUserPreferences, updateUserPreferences, getConversationHistory, type ChatMessage } from '../lib/aiCoach';
import { useAuth } from '../lib/AuthContext';
import type { AICoachPreferences } from '../types/db';

const quickPrompts = [
  { emoji: '💪', label: 'Motivation', prompt: 'Give me some motivation for today\'s workout' },
  { emoji: '🏋️', label: 'Workout Plan', prompt: 'Create a basketball training workout for me' },
  { emoji: '🥗', label: 'Nutrition', prompt: 'What should I eat for optimal performance?' },
  { emoji: '🧠', label: 'Mental Reset', prompt: 'Help me get in the right mindset for competition' },
];

export const ThinkingCorner: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hey there! 👋 I\'m your AI Basketball Coach. I\'m here to help you with training tips, motivation, nutrition advice, and mental preparation. What would you like to work on today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<Partial<AICoachPreferences>>({
    primary_goal: '',
    fitness_level: '',
    training_days_per_week: 3,
    available_equipment: '',
    shooting_goal: '',
    defense_goal: '',
    conditioning_goal: '',
    dietary_restrictions: '',
    nutrition_goal: '',
    mental_focus_areas: '',
    injuries_or_limitations: '',
    notes: '',
  });
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Load user preferences and conversation history on mount
  const loadUserData = useCallback(async () => {
    if (!user) return;

    // Load preferences
    const userPrefs = await getUserPreferences(user.id);
    if (userPrefs) {
      setPreferences(userPrefs);
    }

    // Load conversation history
    const history = await getConversationHistory(user.id, 20);
    if (history.length > 0) {
      setMessages([
        {
          role: 'assistant',
          content: 'Welcome back! 👋 I remember our previous conversations. How can I help you today?',
        },
        ...history.slice(-10), // Last 10 messages
      ]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  const handleSavePreferences = async () => {
    if (!user) return;

    setSavingPreferences(true);
    const result = await updateUserPreferences(user.id, preferences);
    setSavingPreferences(false);

    if (result.success) {
      setShowPreferences(false);
      // Add a system message to acknowledge the update
      const systemMessage: ChatMessage = {
        role: 'assistant',
        content: '✅ Got it! I\'ve updated your profile. I\'ll keep these goals in mind as we work together. Let\'s get started! 💪',
      };
      setMessages([...messages, systemMessage]);
    } else {
      setError(result.error || 'Failed to save preferences');
    }
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || input;
    if (!messageToSend.trim() || loading) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: messageToSend,
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setError(null);

    // Get conversation history (last 5 messages for context)
    const conversationHistory = updatedMessages.slice(-5);

    // Get AI response with user ID for personalization
    const { response, error: apiError } = await getCoachResponse(
      messageToSend,
      conversationHistory,
      user?.id
    );

    setLoading(false);

    if (apiError) {
      // Show error and use fallback
      setError(apiError);
      const fallbackResponse = getFallbackResponse(messageToSend);
      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: fallbackResponse,
      };
      setMessages([...updatedMessages, aiResponse]);
    } else {
      // Add AI response
      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: response,
      };
      setMessages([...updatedMessages, aiResponse]);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-2">
          <SectionHeader 
            title="Thinking Corner" 
            subtitle="Your AI Basketball Coach"
          />
          {user && (
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="px-4 py-2 rounded-xl glass hover:bg-white/10 transition-colors text-sm"
            >
              ⚙️ Goals
            </button>
          )}
        </div>
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-sm text-yellow-400">
              ⚠️ {error}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Using fallback responses. Add your OpenAI API key to .env for full AI features.
            </p>
          </div>
        )}
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <GlassCard className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 gradient-text">Set Your Goals</h2>
              <p className="text-sm text-gray-400 mb-6">
                Tell me about yourself so I can provide personalized coaching! 🎯
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Primary Goal</label>
                  <input
                    type="text"
                    placeholder="e.g., Improve my shooting percentage"
                    value={preferences.primary_goal || ''}
                    onChange={(e) => setPreferences({ ...preferences, primary_goal: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Fitness Level</label>
                  <select
                    value={preferences.fitness_level || ''}
                    onChange={(e) => setPreferences({ ...preferences, fitness_level: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="">Select level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Training Days Per Week</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={preferences.training_days_per_week || 3}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value) && value >= 1 && value <= 7) {
                        setPreferences({ ...preferences, training_days_per_week: value });
                      }
                    }}
                    className="w-full px-4 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Available Equipment</label>
                  <input
                    type="text"
                    placeholder="e.g., Full gym, Home court, Minimal"
                    value={preferences.available_equipment || ''}
                    onChange={(e) => setPreferences({ ...preferences, available_equipment: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Shooting Goal</label>
                  <input
                    type="text"
                    placeholder="e.g., Improve free throw percentage to 80%"
                    value={preferences.shooting_goal || ''}
                    onChange={(e) => setPreferences({ ...preferences, shooting_goal: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Nutrition Goal</label>
                  <input
                    type="text"
                    placeholder="e.g., Build muscle, Lose weight, Maintain"
                    value={preferences.nutrition_goal || ''}
                    onChange={(e) => setPreferences({ ...preferences, nutrition_goal: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Dietary Restrictions</label>
                  <input
                    type="text"
                    placeholder="e.g., Vegetarian, No dairy, None"
                    value={preferences.dietary_restrictions || ''}
                    onChange={(e) => setPreferences({ ...preferences, dietary_restrictions: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Mental Focus Areas</label>
                  <input
                    type="text"
                    placeholder="e.g., Confidence, Focus, Handling pressure"
                    value={preferences.mental_focus_areas || ''}
                    onChange={(e) => setPreferences({ ...preferences, mental_focus_areas: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Injuries or Limitations</label>
                  <textarea
                    placeholder="Any injuries or physical limitations I should know about?"
                    value={preferences.injuries_or_limitations || ''}
                    onChange={(e) => setPreferences({ ...preferences, injuries_or_limitations: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Additional Notes</label>
                  <textarea
                    placeholder="Anything else I should know about you?"
                    value={preferences.notes || ''}
                    onChange={(e) => setPreferences({ ...preferences, notes: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[80px]"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <GradientButton
                  variant="primary"
                  onClick={handleSavePreferences}
                  disabled={savingPreferences}
                  className="flex-1"
                >
                  {savingPreferences ? 'Saving...' : 'Save Goals'}
                </GradientButton>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="px-6 py-3 rounded-xl glass hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Quick Prompts */}
      <div className="px-4 mb-4">
        <p className="text-sm text-gray-400 mb-3">Quick prompts:</p>
        <div className="grid grid-cols-2 gap-3">
          {quickPrompts.map((prompt, idx) => (
            <GlassCard 
              key={idx}
              className="text-center cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => !loading && handleQuickPrompt(prompt.prompt)}
            >
              <div className="text-3xl mb-2">{prompt.emoji}</div>
              <p className="text-xs font-semibold">{prompt.label}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto">
        {messages.map((message, idx) => (
          <div 
            key={idx}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                message.role === 'user' ? 'gradient-primary' : 'gradient-accent'
              }`}>
                {message.role === 'user' ? '👤' : '🤖'}
              </div>

              {/* Message */}
              <div>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'gradient-primary' 
                    : 'glass'
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[85%]">
              <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-xl flex-shrink-0">
                🤖
              </div>
              <div className="glass rounded-2xl px-4 py-3">
                <p className="text-sm text-gray-400">Thinking...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="glass-dark border-t border-white/10 px-4 py-4 sticky bottom-0">
        <div className="flex gap-2 items-end">
          <input
            type="text"
            placeholder="Ask your AI coach anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-2xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
          <GradientButton 
            variant="primary" 
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || loading}
            className="rounded-2xl"
          >
            {loading ? 'Sending...' : 'Send'}
          </GradientButton>
        </div>
      </div>
    </div>
  );
};
