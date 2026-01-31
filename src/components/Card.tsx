import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'glass-dark';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  variant = 'glass',
  hover = false
}) => {
  const baseStyles = 'rounded-2xl p-6 transition-all duration-300';
  const hoverStyles = hover ? 'hover:scale-105 hover:shadow-2xl cursor-pointer' : '';
  
  const variants = {
    glass: 'glass',
    'glass-dark': 'glass-dark',
  };
  
  return (
    <div className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};
