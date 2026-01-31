import React from 'react';

interface StatPillProps {
  label: string;
  value: string | number;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'glass';
  className?: string;
}

export const StatPill: React.FC<StatPillProps> = ({ 
  label, 
  value, 
  icon,
  variant = 'glass',
  className = '' 
}) => {
  const variants = {
    primary: 'gradient-primary',
    secondary: 'gradient-secondary',
    accent: 'gradient-accent',
    glass: 'glass',
  };
  
  return (
    <div className={`${variants[variant]} rounded-full px-4 py-2 flex items-center gap-2 ${className}`}>
      {icon && <span className="text-lg">{icon}</span>}
      <div className="flex flex-col">
        <span className="text-xs text-gray-300">{label}</span>
        <span className="text-sm font-bold">{value}</span>
      </div>
    </div>
  );
};
