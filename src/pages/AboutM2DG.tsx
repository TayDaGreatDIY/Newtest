import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, SectionHeader } from '../components';

export const AboutM2DG: React.FC = () => {
  const navigate = useNavigate();

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
        title="About M2DG" 
        subtitle="Mission, Values & Community Guidelines"
      />

      {/* Mission Statement */}
      <GlassCard className="mb-4">
        <div className="text-center mb-4">
          <div className="text-6xl mb-4">🏀</div>
          <h2 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
            Meet 2 Dunk & Grind
          </h2>
          <p className="text-gray-400">Your Basketball Community Platform</p>
        </div>
      </GlassCard>

      {/* What We're About */}
      <GlassCard className="mb-4">
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
          <span>🎯</span>
          <span>What We're About</span>
        </h3>
        <div className="space-y-3 text-gray-300">
          <p>
            M2DG (Meet 2 Dunk & Grind) is a platform dedicated to bringing basketball players together. 
            Whether you're a seasoned athlete or just starting out, M2DG provides a space to:
          </p>
          <ul className="space-y-2 ml-4">
            <li>• Find and check in to local basketball courts</li>
            <li>• Challenge yourself and others in skill competitions</li>
            <li>• Connect with fellow players in your community</li>
            <li>• Track your progress and achievements</li>
            <li>• Share your basketball journey</li>
          </ul>
        </div>
      </GlassCard>

      {/* Our Values */}
      <GlassCard className="mb-4">
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
          <span>💪</span>
          <span>Our Values</span>
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-purple-400 mb-1">Grind & Hard Work</h4>
            <p className="text-sm text-gray-400">
              We believe in dedication, consistent effort, and pushing yourself to improve every day.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-pink-400 mb-1">Respect & Sportsmanship</h4>
            <p className="text-sm text-gray-400">
              Treat every player with respect, whether you win or lose. Good sportsmanship builds great communities.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-orange-400 mb-1">Safety & Organization</h4>
            <p className="text-sm text-gray-400">
              We promote safe, organized basketball that brings out the best in everyone.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-400 mb-1">Consistency & Growth</h4>
            <p className="text-sm text-gray-400">
              Regular practice and persistent effort lead to real improvement and lasting success.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Community Guidelines */}
      <GlassCard className="mb-4">
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
          <span>🤝</span>
          <span>Community Guidelines</span>
        </h3>
        <div className="space-y-3 text-gray-300">
          <p className="font-medium">We expect all M2DG community members to:</p>
          
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="text-green-400 flex-shrink-0">✓</div>
              <div>
                <strong>Be Respectful:</strong> Treat all players with dignity and respect, regardless of skill level.
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="text-green-400 flex-shrink-0">✓</div>
              <div>
                <strong>Play Fair:</strong> Compete honestly and follow the rules. No cheating or unsportsmanlike conduct.
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="text-green-400 flex-shrink-0">✓</div>
              <div>
                <strong>Stay Positive:</strong> Encourage others, celebrate achievements, and support your community.
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="text-green-400 flex-shrink-0">✓</div>
              <div>
                <strong>Stay Safe:</strong> Look out for yourself and others. Report safety concerns immediately.
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="font-medium text-red-400 mb-2">❌ We Do NOT Tolerate:</p>
            <ul className="space-y-1 text-sm text-red-300">
              <li>• Bullying or harassment of any kind</li>
              <li>• Discriminatory behavior or hate speech</li>
              <li>• Threats or violence</li>
              <li>• Cheating or dishonest play</li>
              <li>• Spam or inappropriate content</li>
            </ul>
            <p className="text-sm text-red-400 mt-3">
              Violations may result in account suspension or permanent ban.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Terms of Service */}
      <GlassCard className="mb-4">
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
          <span>📋</span>
          <span>Terms of Service</span>
        </h3>
        <div className="space-y-3 text-sm text-gray-400">
          <p>
            By using M2DG, you agree to:
          </p>
          <ul className="space-y-2 ml-4">
            <li>• Follow all community guidelines and rules</li>
            <li>• Be responsible for your account security</li>
            <li>• Provide accurate information when creating challenges or posts</li>
            <li>• Respect intellectual property rights</li>
            <li>• Accept that court availability and conditions may vary</li>
            <li>• Participate at your own risk and follow local safety guidelines</li>
          </ul>
          
          <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-yellow-400 text-xs">
              <strong>Disclaimer:</strong> M2DG is a platform for connecting basketball players. 
              We are not responsible for injuries, property damage, or disputes that occur during 
              in-person activities. Always follow local laws and safety guidelines.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Contact */}
      <GlassCard className="mb-6">
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
          <span>📧</span>
          <span>Contact Us</span>
        </h3>
        <p className="text-gray-400 text-sm mb-3">
          Have questions, concerns, or feedback? We'd love to hear from you!
        </p>
        <div className="space-y-2 text-sm">
          <p className="text-gray-300">
            <strong>Email:</strong> <span className="text-purple-400">support@m2dg.app</span>
          </p>
          <p className="text-gray-300">
            <strong>Report Issues:</strong> <span className="text-purple-400">report@m2dg.app</span>
          </p>
        </div>
      </GlassCard>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mb-6">
        <p>© 2024 Meet 2 Dunk & Grind (M2DG)</p>
        <p>Version 1.0.0</p>
      </div>
    </div>
  );
};
