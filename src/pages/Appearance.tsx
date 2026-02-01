import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, SectionHeader, GradientButton, useToast } from '../components';

export const Appearance: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // Current applied settings (loaded from localStorage)
  const [appliedTheme, setAppliedTheme] = useState<'dark' | 'light'>('dark');
  const [appliedAccentColor, setAppliedAccentColor] = useState('purple');
  
  // Pending changes (user is previewing)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [accentColor, setAccentColor] = useState('purple');
  
  // Track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('m2dg_theme') as 'dark' | 'light' || 'dark';
    const savedAccentColor = localStorage.getItem('m2dg_accent_color') || 'purple';
    
    setAppliedTheme(savedTheme);
    setAppliedAccentColor(savedAccentColor);
    setTheme(savedTheme);
    setAccentColor(savedAccentColor);
    
    // Apply the saved theme
    applyThemeToDocument(savedTheme, savedAccentColor);
  }, []);

  // Check if there are unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(
      theme !== appliedTheme || accentColor !== appliedAccentColor
    );
  }, [theme, accentColor, appliedTheme, appliedAccentColor]);

  const applyThemeToDocument = (selectedTheme: 'dark' | 'light', selectedAccentColor: string) => {
    const root = document.documentElement;
    
    // Apply theme
    if (selectedTheme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
    
    // Apply accent color by setting CSS custom properties
    const accentColorMap: Record<string, { from: string; to: string }> = {
      purple: { from: '#a855f7', to: '#ec4899' },
      blue: { from: '#3b82f6', to: '#06b6d4' },
      green: { from: '#10b981', to: '#059669' },
      orange: { from: '#f97316', to: '#ef4444' },
      pink: { from: '#ec4899', to: '#f43f5e' },
    };
    
    const colors = accentColorMap[selectedAccentColor] || accentColorMap.purple;
    root.style.setProperty('--accent-from', colors.from);
    root.style.setProperty('--accent-to', colors.to);
  };

  const handleConfirmChanges = () => {
    // Save to localStorage
    localStorage.setItem('m2dg_theme', theme);
    localStorage.setItem('m2dg_accent_color', accentColor);
    
    // Apply the theme
    applyThemeToDocument(theme, accentColor);
    
    // Update applied state
    setAppliedTheme(theme);
    setAppliedAccentColor(accentColor);
    
    showToast('Appearance settings saved!', 'success');
  };

  const handleResetChanges = () => {
    setTheme(appliedTheme);
    setAccentColor(appliedAccentColor);
    showToast('Changes reset', 'info');
  };

  const accentColors = [
    { name: 'Purple', value: 'purple', gradient: 'from-purple-500 to-pink-500' },
    { name: 'Blue', value: 'blue', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Green', value: 'green', gradient: 'from-green-500 to-emerald-500' },
    { name: 'Orange', value: 'orange', gradient: 'from-orange-500 to-red-500' },
    { name: 'Pink', value: 'pink', gradient: 'from-pink-500 to-rose-500' },
  ];

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
        title="Appearance" 
        subtitle="Customize how M2DG looks"
      />

      {/* Theme Selection */}
      <GlassCard className="mb-4">
        <h3 className="text-lg font-bold mb-3">Theme</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border-2 transition-all ${
              theme === 'dark'
                ? 'border-purple-500 bg-white/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="text-3xl mb-2">🌙</div>
            <p className="font-medium">Dark</p>
            <p className="text-xs text-gray-400">Easy on the eyes</p>
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border-2 transition-all ${
              theme === 'light'
                ? 'border-purple-500 bg-white/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="text-3xl mb-2">☀️</div>
            <p className="font-medium">Light</p>
            <p className="text-xs text-gray-400">Coming soon</p>
          </button>
        </div>
      </GlassCard>

      {/* Accent Color */}
      <GlassCard className="mb-4">
        <h3 className="text-lg font-bold mb-3">Accent Color</h3>
        <p className="text-sm text-gray-400 mb-4">Choose your primary color</p>
        <div className="grid grid-cols-2 gap-3">
          {accentColors.map((color) => (
            <button
              key={color.value}
              onClick={() => setAccentColor(color.value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                accentColor === color.value
                  ? 'border-purple-500 bg-white/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${color.gradient} mb-2 mx-auto`} />
              <p className="font-medium">{color.name}</p>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Display Settings */}
      <GlassCard className="mb-4">
        <h3 className="text-lg font-bold mb-3">Display</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Animations</p>
              <p className="text-sm text-gray-400">Enable smooth transitions and effects</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Reduce Motion</p>
              <p className="text-sm text-gray-400">Minimize animations for accessibility</p>
            </div>
            <input type="checkbox" className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">High Contrast</p>
              <p className="text-sm text-gray-400">Increase contrast for better visibility</p>
            </div>
            <input type="checkbox" className="toggle" />
          </div>
        </div>
      </GlassCard>

      {/* Font Size */}
      <GlassCard className="mb-6">
        <h3 className="text-lg font-bold mb-3">Font Size</h3>
        <div className="space-y-3">
          <input 
            type="range" 
            min="80" 
            max="120" 
            defaultValue="100"
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>Small</span>
            <span>Default</span>
            <span>Large</span>
          </div>
        </div>
      </GlassCard>

      {/* Preview */}
      <GlassCard className="mb-6">
        <h3 className="text-lg font-bold mb-3">Preview</h3>
        <div className="p-4 rounded-xl bg-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-xl">
              🏀
            </div>
            <div>
              <p className="font-bold">Sample Post</p>
              <p className="text-sm text-gray-400">This is how your theme looks</p>
            </div>
          </div>
          <p className="text-sm mb-3">
            Just finished an amazing session at the court! Who's up for a challenge? 🎯
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-sm font-medium">
              Primary Button
            </button>
            <button className="px-4 py-2 rounded-full glass text-sm font-medium">
              Secondary
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Confirm Changes Button */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-50">
          <GlassCard className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold">You have unsaved changes</p>
                <p className="text-sm text-gray-400">Confirm to apply your new appearance settings</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleResetChanges}
                  className="px-4 py-2 rounded-xl glass hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  Reset
                </button>
                <GradientButton
                  variant="primary"
                  onClick={handleConfirmChanges}
                >
                  Confirm Changes
                </GradientButton>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
