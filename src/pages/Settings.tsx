import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, SectionHeader, Badge } from '../components';
import { useAuth } from '../lib/AuthContext';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

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
        title="Account Settings" 
        subtitle="Manage your account preferences"
      />

      {/* Account Information */}
      <GlassCard className="mb-4">
        <h3 className="text-lg font-bold mb-3">Account Information</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400">Display Name</label>
            <p className="text-white font-medium">{profile?.display_name || 'Not set'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400">Email</label>
            <p className="text-white">{user?.email || 'Not available'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400">Account Status</label>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="accent">Active</Badge>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Privacy Settings */}
      <GlassCard className="mb-4">
        <h3 className="text-lg font-bold mb-3">Privacy</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Profile Visibility</p>
              <p className="text-sm text-gray-400">Allow others to view your profile</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Activity Status</p>
              <p className="text-sm text-gray-400">Let others see when you're active</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow Messages</p>
              <p className="text-sm text-gray-400">Receive messages from other users</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
        </div>
      </GlassCard>

      {/* Data & Storage */}
      <GlassCard className="mb-4">
        <h3 className="text-lg font-bold mb-3">Data & Storage</h3>
        <div className="space-y-3">
          <button className="w-full text-left glass rounded-xl p-3 hover:bg-white/10 transition-colors">
            <p className="font-medium">Download Your Data</p>
            <p className="text-sm text-gray-400">Export all your M2DG data</p>
          </button>
          <button className="w-full text-left glass rounded-xl p-3 hover:bg-white/10 transition-colors">
            <p className="font-medium">Clear Cache</p>
            <p className="text-sm text-gray-400">Free up storage space</p>
          </button>
        </div>
      </GlassCard>

      {/* Danger Zone */}
      <GlassCard className="mb-6 border border-red-500/20">
        <h3 className="text-lg font-bold mb-3 text-red-400">Danger Zone</h3>
        <div className="space-y-3">
          <button className="w-full text-left glass rounded-xl p-3 hover:bg-red-500/10 transition-colors border border-red-500/20">
            <p className="font-medium text-red-400">Deactivate Account</p>
            <p className="text-sm text-gray-400">Temporarily disable your account</p>
          </button>
          <button className="w-full text-left glass rounded-xl p-3 hover:bg-red-500/10 transition-colors border border-red-500/20">
            <p className="font-medium text-red-400">Delete Account</p>
            <p className="text-sm text-gray-400">Permanently delete your account and data</p>
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
