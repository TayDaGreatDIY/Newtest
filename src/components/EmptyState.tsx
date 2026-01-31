import React from 'react';
import { GradientButton } from './GradientButton';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = '📭',
  title, 
  description,
  actionLabel,
  onAction,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      {description && <p className="text-gray-400 mb-6 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <GradientButton variant="primary" onClick={onAction}>
          {actionLabel}
        </GradientButton>
      )}
    </div>
  );
};
