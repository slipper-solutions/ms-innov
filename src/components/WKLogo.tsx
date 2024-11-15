import React from 'react';
import logoImage from '../assets/wk-logo.png';

export function WKLogo({ className = '' }: { className?: string }) {
  return (
    <img 
      src={logoImage} 
      alt="Wonderkind" 
      className={className}
    />
  );
} 