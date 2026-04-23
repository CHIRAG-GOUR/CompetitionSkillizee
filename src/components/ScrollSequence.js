'use client';
import { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

export default function ScrollSequence({ totalFrames = 300 }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);

  // Scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Map scroll progress (0-1) to frame index (1-300)
  const frameIndex = useTransform(scrollYProgress, [0, 1], [1, totalFrames]);

  // Preload images
  useEffect(() => {
    const loadedImages = [];
    let loaded = 0;

    const preloadImages = () => {
      for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        const frameNum = String(i).padStart(3, '0');
        img.src = `/header/ezgif-frame-${frameNum}.jpg`;
        loadedImages[i] = img;
      }
      setImages(loadedImages);
    };

    preloadImages();
  }, [totalFrames]);

  // Draw frame on canvas when frameIndex changes
  useEffect(() => {
    const render = () => {
      const context = canvasRef.current?.getContext('2d');
      if (context && images[Math.floor(frameIndex.get())]) {
        const img = images[Math.floor(frameIndex.get())];
        
        // Handle responsive canvas sizing
        const canvas = canvasRef.current;
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width / 2) - (img.width / 2) * scale;
        const y = (canvas.height / 2) - (img.height / 2) * scale;
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, x, y, img.width * scale, img.height * scale);
      }
    };

    const unsubscribe = frameIndex.on("change", render);
    // Initial render
    if (images.length > 0) render();
    
    return () => unsubscribe();
  }, [images, frameIndex]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="sequence-container">
      <div className="sticky-wrapper">
        <canvas ref={canvasRef} className="sequence-canvas" />
        
        {/* Content Overlay */}
        <motion.div 
          style={{ opacity: useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]) }}
          className="sequence-content"
        >
          <h1 className="hero-title">Experience the Evolution</h1>
          <p className="hero-subtitle">Scroll to discover the system anatomy.</p>
        </motion.div>
      </div>
    </div>
  );
}
