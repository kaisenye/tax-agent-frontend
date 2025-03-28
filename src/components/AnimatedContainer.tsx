import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
}

const AnimatedContainer: React.FC<AnimatedContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const location = useLocation();
  const timerRef = useRef<number>();
  const prevPathRef = useRef<string>(location.pathname);
  
  // Handle entry animation on mount
  useEffect(() => {
    setIsVisible(true);
    setShouldRender(true);
  }, []);

  // Handle route changes
  useEffect(() => {
    // When location changes
    const currentPath = location.pathname;
    
    // Only trigger exit animation if we're actually changing routes
    if (prevPathRef.current !== currentPath) {
      prevPathRef.current = currentPath;
      
      // This is a real navigation, ensure we're visible
      setIsVisible(true);
      setShouldRender(true);
    } else {
      // Same route, just ensure we're visible
      setIsVisible(true);
      setShouldRender(true);
    }
    
    return () => {
      // Only run the exit logic if we're actually changing routes
      if (prevPathRef.current !== location.pathname) {
        // This runs when the component is about to unmount
        setIsVisible(false);
        
        // Delay the actual unmounting to allow animation to complete
        timerRef.current = window.setTimeout(() => {
          setShouldRender(false);
        }, 200); // Match this to your animation duration
      }
    };
  }, [location]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div 
      className={`w-full h-screen mx-auto px-6 py-2 ${isVisible ? 'animate-fadeIn' : 'animate-fadeOut'} ${className}`}
    >
      {children}
    </div>
  );
};

export default AnimatedContainer; 