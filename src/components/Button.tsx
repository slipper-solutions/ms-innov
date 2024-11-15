import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: `
      bg-gradient-to-r from-[#4472CA] to-[#6366F1] 
      text-white 
      hover:from-[#3461B9] hover:to-[#5E4BB6] 
      shadow-[0_2px_8px_-2px_rgba(99,102,241,0.3)] 
      hover:shadow-[0_4px_12px_-2px_rgba(99,102,241,0.4)] 
      transition-all duration-300
    `,
    ghost: 'text-[#303B5F] hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300',
    outline: `
      border border-gradient-to-r from-blue-200/50 to-purple-200/50 
      text-[#303B5F] 
      hover:bg-gradient-to-br hover:from-blue-50/30 hover:to-purple-50/30 
      hover:shadow-sm 
      transition-all duration-300
    `
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
}