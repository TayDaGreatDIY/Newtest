import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/app/feed', icon: '🏠', label: 'Feed' },
  { path: '/app/courts', icon: '🏀', label: 'Courts' },
  { path: '/app/coaches', icon: '🏆', label: 'Coaches' },
  { path: '/app/messages', icon: '💬', label: 'Messages' },
  { path: '/app/profile', icon: '👤', label: 'Profile' },
];

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-dark border-t border-white/10 pb-safe">
      <div className="max-w-screen-xl mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-300 min-w-[64px] ${
                isActive
                  ? 'gradient-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
