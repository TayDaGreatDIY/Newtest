import React from 'react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const GradientButton: React.FC<GradientButtonProps> = ({ 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props 
}) => {
  const baseStyles = 'font-semibold rounded-full transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'gradient-primary text-white shadow-lg shadow-purple-500/50',
    secondary: 'gradient-secondary text-white shadow-lg shadow-pink-500/50',
    accent: 'gradient-accent text-white shadow-lg shadow-cyan-500/50',
    glass: 'glass text-white hover:bg-white/10',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
