import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from '../components';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-black grid-overlay pb-20">
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20">
        <main className="w-full max-w-screen-xl mx-auto">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
};
