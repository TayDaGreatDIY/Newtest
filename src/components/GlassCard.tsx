import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '',
  onClick 
}) => {
  return (
    <div 
      className={`glass rounded-2xl p-4 transition-all duration-300 ${onClick ? 'cursor-pointer hover:bg-white/10' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
