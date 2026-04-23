'use client';
import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isPointer, setIsPointer] = useState(false);
  const cursorX = useSpring(0, { damping: 20, stiffness: 100 });
  const cursorY = useSpring(0, { damping: 20, stiffness: 100 });
  const outerX = useSpring(0, { damping: 15, stiffness: 80 });
  const outerY = useSpring(0, { damping: 15, stiffness: 80 });

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      outerX.set(e.clientX);
      outerY.set(e.clientY);
    };

    const handlePointer = () => {
      const hoveredElement = document.querySelector(':hover');
      if (hoveredElement && (
        hoveredElement.tagName === 'A' || 
        hoveredElement.tagName === 'BUTTON' || 
        hoveredElement.closest('a') || 
        hoveredElement.closest('button')
      )) {
        setIsPointer(true);
      } else {
        setIsPointer(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handlePointer);
    
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handlePointer);
    };
  }, [cursorX, cursorY, outerX, outerY]);

  return (
    <>
      {/* Inner Dot */}
      <motion.div
        className="cursor-dot"
        style={{ x: cursorX, y: cursorY }}
      />
      
      {/* Outer Ring */}
      <motion.div
        className={`cursor-ring ${isPointer ? 'active' : ''}`}
        style={{ x: outerX, y: outerY }}
      />

      {/* Mouse Spotlight / Torch */}
      <motion.div
        className="mouse-spotlight"
        style={{ x: outerX, y: outerY }}
      />
    </>
  );
}
