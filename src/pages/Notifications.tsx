import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, SectionHeader } from '../components';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    challenges: true,
    messages: true,
    checkIns: true,
    achievements: true,
    soundEnabled: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen px-4 py-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/app/profile')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
      >
        <span>←</span>
        <span>Back to Profile</span>
      </button>

      <SectionHeader 
        title="Notifications" 
        subtitle="Manage your notification preferences"
      />

      {/* General Settings */}
      <GlassCard className="mb-4">
        <h3 className="text-lg font-bold mb-3">General</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-gray-400">Receive push notifications on your device</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.pushEnabled}
              onChange={() => handleToggle('pushEnabled')}
              className="toggle" 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-400">Receive notifications via email</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.emailEnabled}
              onChange={() => handleToggle('emailEnabled')}
              className="toggle" 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sound</p>
              <p className="text-sm text-gray-400">Play sound for notifications</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.soundEnabled}
              onChange={() => handleToggle('soundEnabled')}
              className="toggle" 
            />
          </div>
        </div>
      </GlassCard>

      {/* Activity Notifications */}
      <GlassCard className="mb-4">
        <h3 className="text-lg font-bold mb-3">Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-medium">Challenges</p>
                <p className="text-sm text-gray-400">New challenges and results</p>
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={settings.challenges}
              onChange={() => handleToggle('challenges')}
              className="toggle" 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <p className="font-medium">Messages</p>
                <p className="text-sm text-gray-400">New messages from other players</p>
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={settings.messages}
              onChange={() => handleToggle('messages')}
              className="toggle" 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="font-medium">Check-ins</p>
                <p className="text-sm text-gray-400">Players checking in at your courts</p>
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={settings.checkIns}
              onChange={() => handleToggle('checkIns')}
              className="toggle" 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-medium">Achievements</p>
                <p className="text-sm text-gray-400">Unlocked achievements and milestones</p>
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={settings.achievements}
              onChange={() => handleToggle('achievements')}
              className="toggle" 
            />
          </div>
        </div>
      </GlassCard>

      {/* Notification Schedule */}
      <GlassCard className="mb-6">
        <h3 className="text-lg font-bold mb-3">Do Not Disturb</h3>
        <div className="space-y-3">
          <p className="text-sm text-gray-400">Set quiet hours when you don't want to receive notifications</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400">From</label>
              <input 
                type="time" 
                defaultValue="22:00"
                className="w-full mt-1 px-3 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">To</label>
              <input 
                type="time" 
                defaultValue="08:00"
                className="w-full mt-1 px-3 py-2 rounded-xl glass focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
