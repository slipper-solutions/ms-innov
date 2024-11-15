import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div 
      className={`bg-white rounded-lg shadow-[0_4px_12px_-2px_rgba(99,102,241,0.1)] 
      border border-gradient-to-br from-blue-100/50 via-purple-50/30 to-blue-50/50 
      p-6 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}