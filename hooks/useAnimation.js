import { useState } from 'react';

export function useAnimation(animationName, duration = 500) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), duration);
  };
  
  return [isAnimating, triggerAnimation];
}