import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Badge } from '../components';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-16">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-16 pt-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center font-bold text-xl">
              M
            </div>
            <span className="text-2xl font-bold">M2DG</span>
          </div>
          <Button variant="glass" size="sm" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </header>

        {/* Main Hero */}
        <div className="text-center mb-20 mt-12">
          <Badge variant="accent" className="mb-6">
            PWA Ready • Mobile First • 2026
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Next Gen Sports
            <br />
            Experience
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Track your performance, compete with friends, and reach new heights with our cutting-edge mobile platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
            <Button variant="glass" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card hover variant="glass">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
            <p className="text-gray-400">
              Blazing fast performance with cutting-edge technology
            </p>
          </Card>
          
          <Card hover variant="glass">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold mb-2">Mobile First</h3>
            <p className="text-gray-400">
              Designed for the best mobile experience possible
            </p>
          </Card>
          
          <Card hover variant="glass">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold mb-2">Modern UI</h3>
            <p className="text-gray-400">
              Glass morphism with beautiful gradients
            </p>
          </Card>
        </div>

        {/* Stats Section */}
        <Card variant="glass-dark" className="p-8 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
                50K+
              </div>
              <div className="text-sm text-gray-400">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-secondary bg-clip-text text-transparent mb-2">
                1M+
              </div>
              <div className="text-sm text-gray-400">Workouts Logged</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-accent bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-sm text-gray-400">Support</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
                4.9★
              </div>
              <div className="text-sm text-gray-400">App Rating</div>
            </div>
          </div>
        </Card>

        {/* CTA Section */}
        <div className="text-center py-16">
          <h2 className="text-4xl font-bold mb-6">Ready to Start?</h2>
          <p className="text-gray-400 mb-8">Join thousands of athletes achieving their goals</p>
          <Button variant="primary" size="lg" onClick={() => navigate('/auth')}>
            Create Account
          </Button>
        </div>
      </div>
    </div>
  );
};
