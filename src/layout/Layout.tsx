import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black grid-overlay">
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20">
        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
