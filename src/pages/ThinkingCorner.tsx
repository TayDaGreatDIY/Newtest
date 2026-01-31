import React, { useState } from 'react';
import { GlassCard, SectionHeader, GradientButton } from '../components';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const quickPrompts = [
  { emoji: '💪', label: 'Motivation', prompt: 'Give me some motivation for today\'s workout' },
  { emoji: '🏋️', label: 'Workout Plan', prompt: 'Create a basketball training workout for me' },
  { emoji: '🥗', label: 'Nutrition', prompt: 'What should I eat for optimal performance?' },
  { emoji: '🧠', label: 'Mental Reset', prompt: 'Help me get in the right mindset for competition' },
];

export const ThinkingCorner: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hey there! 👋 I\'m your AI Basketball Coach. I\'m here to help you with training tips, motivation, nutrition advice, and mental preparation. What would you like to work on today?',
    },
  ]);
  const [input, setInput] = useState('');

  const handleSendMessage = (message?: string) => {
    const messageToSend = message || input;
    if (!messageToSend.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
    };
    setMessages([...messages, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(messageToSend),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);

    setInput('');
  };

  const getAIResponse = (prompt: string): string => {
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
      return 'That\'s a great question! I\'m here to help with training, motivation, nutrition, and mental preparation. Try using one of the quick prompts below, or ask me anything specific about your basketball journey! 🏀';
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 py-6">
        <SectionHeader 
          title="Thinking Corner" 
          subtitle="Your AI Basketball Coach"
        />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 mb-4">
        <p className="text-sm text-gray-400 mb-3">Quick prompts:</p>
        <div className="grid grid-cols-2 gap-3">
          {quickPrompts.map((prompt, idx) => (
            <GlassCard 
              key={idx}
              className="text-center cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => handleQuickPrompt(prompt.prompt)}
            >
              <div className="text-3xl mb-2">{prompt.emoji}</div>
              <p className="text-xs font-semibold">{prompt.label}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div 
            key={message.id}
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
      </div>

      {/* Input */}
      <div className="glass-dark border-t border-white/10 px-4 py-4 sticky bottom-0">
        <div className="flex gap-2 items-end">
          <input
            type="text"
            placeholder="Ask your AI coach anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-4 py-3 rounded-2xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
          <GradientButton 
            variant="primary" 
            onClick={() => handleSendMessage()}
            disabled={!input.trim()}
            className="rounded-2xl"
          >
            Send
          </GradientButton>
        </div>
      </div>
    </div>
  );
};
