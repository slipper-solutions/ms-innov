import React, { useEffect, useState } from 'react';

const loadingMessages = {
  copy: [
    { main: "Analyzing your copy...", sub: "Checking for engagement factors" },
    { main: "AI at work...", sub: "Making your words shine ✨" },
    { main: "Almost there...", sub: "Polishing every word" },
    { main: "Getting creative...", sub: "Adding that special touch" },
    { main: "Processing...", sub: "Making LinkedIn jealous 😉" }
  ],
  image: [
    { main: "Analyzing your image...", sub: "Looking for the perfect details" },
    { main: "AI vision engaged...", sub: "Seeing things humans might miss" },
    { main: "Processing pixels...", sub: "Making Instagram envious 📸" },
    { main: "Almost there...", sub: "Finding the visual story" },
    { main: "Analyzing composition...", sub: "Discovering the magic" }
  ],
  generation: [
    { main: "Generating masterpiece...", sub: "Channeling our inner Picasso" },
    { main: "AI brushes moving...", sub: "Creating digital magic ✨" },
    { main: "Almost there...", sub: "Adding final touches" },
    { main: "Processing...", sub: "Making art history 🎨" }
  ]
};

interface LoadingSpinnerProps {
  type: 'copy' | 'image' | 'generation';
  className?: string;
}

export function LoadingSpinner({ type, className = '' }: LoadingSpinnerProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(current => 
        current === loadingMessages[type].length - 1 ? 0 : current + 1
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [type]);

  return (
    <div className={`flex flex-col items-center justify-center p-4 space-y-4 ${className}`}>
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-blue-200/30 border-t-blue-500 border-r-purple-500 animate-spin" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-r-purple-300/50 animate-pulse" />
      </div>
      
      <div className="text-center space-y-1">
        <p className="text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {loadingMessages[type][messageIndex].main}
        </p>
        <p className="text-sm text-gray-500">
          {loadingMessages[type][messageIndex].sub}
        </p>
      </div>
    </div>
  );
} 