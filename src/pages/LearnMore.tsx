import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../components';

export const LearnMore: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-16 pt-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center font-bold text-xl">
              M
            </div>
            <span className="text-2xl font-bold">M2DG</span>
          </div>
          <Button variant="glass" size="sm" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </header>

        {/* Section 1 - What is M2DG? */}
        <section className="mb-20">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            What is M2DG?
          </h1>
          <Card variant="glass" className="p-8">
            <p className="text-lg text-gray-300 leading-relaxed">
              M2DG (Married 2 Da Game) turns real court time into a game you can level up in. 
              Check in at real courts, complete skill missions, earn rewards, and climb leaderboards—built 
              to keep the culture positive and the work real.
            </p>
          </Card>
        </section>

        {/* Section 2 - How it Works */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hover variant="glass" className="p-6">
              <div className="text-5xl mb-4 text-center">📍</div>
              <h3 className="text-2xl font-bold mb-3 text-center">1. Check In</h3>
              <h4 className="text-lg font-semibold mb-2 text-cyan-400 text-center">
                GPS + QR Verified
              </h4>
              <p className="text-gray-400">
                Use GPS location or scan a QR code at verified courts to prove you're really putting in the work. 
                No fake stats—only real runs count.
              </p>
            </Card>

            <Card hover variant="glass" className="p-6">
              <div className="text-5xl mb-4 text-center">🎯</div>
              <h3 className="text-2xl font-bold mb-3 text-center">2. Play</h3>
              <h4 className="text-lg font-semibold mb-2 text-purple-400 text-center">
                Challenges &amp; Missions
              </h4>
              <p className="text-gray-400">
                Complete daily and weekly skill challenges. Train solo or go head-to-head with friends. 
                Turn every session into a competition.
              </p>
            </Card>

            <Card hover variant="glass" className="p-6">
              <div className="text-5xl mb-4 text-center">🏆</div>
              <h3 className="text-2xl font-bold mb-3 text-center">3. Level Up</h3>
              <h4 className="text-lg font-semibold mb-2 text-pink-400 text-center">
                Badges + Ranks
              </h4>
              <p className="text-gray-400">
                Earn XP, build streaks, unlock badges, and see where you rank on court, city, 
                and global leaderboards. Your work becomes visible.
              </p>
            </Card>
          </div>
        </section>

        {/* Section 3 - Why It's Different */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Why It's Different
          </h2>
          <Card variant="glass-dark" className="p-8">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 text-2xl flex-shrink-0">✓</span>
                <span className="text-lg text-gray-300">
                  <strong className="text-white">No fantasy stats</strong> — real effort only
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 text-2xl flex-shrink-0">✓</span>
                <span className="text-lg text-gray-300">
                  <strong className="text-white">Positive competition</strong> (respect first)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-pink-400 text-2xl flex-shrink-0">✓</span>
                <span className="text-lg text-gray-300">
                  <strong className="text-white">Built for athletes, kids, and parents</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 text-2xl flex-shrink-0">✓</span>
                <span className="text-lg text-gray-300">
                  <strong className="text-white">Court • City • Global leaderboards</strong>
                </span>
              </li>
            </ul>
          </Card>
        </section>

        {/* Section 4 - Safety & Parents */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Why Parents Trust M2DG
          </h2>
          <Card variant="glass" className="p-8">
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              M2DG is built for real hoopers — and real peace of mind.
              Every check-in is verified using GPS or QR codes, so players can prove they showed up and put in real work — and parents, coaches, and trainers can trust what's being tracked.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              Whether you're a pro, college athlete, high school hooper, youth player, or someone who just loves the game, M2DG promotes discipline, accountability, and positive competition. It's a system that rewards consistency, effort, and growth — not hype.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              With community-driven respect and zero tolerance for fake stats or negativity, M2DG creates a space where athletes of every age and level can compete, improve, and represent their court with purpose.
            </p>
          </Card>
        </section>

        {/* Section 5 - CTA */}
        <section className="text-center py-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-gray-400 mb-10 text-lg max-w-2xl mx-auto">
            Join M2DG today and turn every court session into progress. Real hoops. Real growth. Real community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" onClick={() => navigate('/auth/sign-up')}>
              Get Started
            </Button>
            <Button variant="glass" size="lg" onClick={() => navigate('/auth/sign-in')}>
              Sign In
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};
