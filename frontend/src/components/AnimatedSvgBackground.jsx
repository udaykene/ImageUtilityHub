import React, { useEffect, useRef } from 'react';

const AnimatedSvgBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // SVG templates
    const svgTemplates = [
      // Green document icon
      `<svg viewBox="0 0 32 32" class="svg-bg-element"><path d="M25.6 0H6.4C2.865 0 0 2.865 0 6.4V25.6C0 29.135 2.865 32 6.4 32H25.6C29.135 32 32 29.135 32 25.6V6.4C32 2.865 29.135 0 25.6 0Z" fill="url(#grad)"/><path d="M5.96 24.88C5.43 25.95 6.2 27.2 7.39 27.2H18.21C19.4 27.2 20.17 25.95 19.64 24.88L14.23 14.06C13.64 12.88 11.96 12.88 11.37 14.06L5.96 24.88Z" fill="#fff"/><path d="M15.56 24.88C15.03 25.95 15.8 27.2 16.99 27.2H24.61C25.8 27.2 26.57 25.95 26.04 24.88L22.23 17.26C21.64 16.08 19.96 16.08 19.37 17.26L15.56 24.88Z" fill="#fff" opacity="0.6"/><path d="M24 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" fill="#fff"/><defs><linearGradient id="grad" x1="16" y1="0" x2="16" y2="32"><stop stop-color="#00E676"/><stop offset="1" stop-color="#00C853"/></linearGradient></defs></svg>`,
      
      // Pink cat icon
      `<svg viewBox="0 0 100 100" class="svg-bg-element"><path fill="#fb7369" d="M36.52 12.01c-3.03 0-5.49 2.43-5.54 5.46-.35 19.49-3.88 38.82-10.49 57.05-.85 2.34.85 4.82 3.14 4.54 7.75-.92 14.99-2.54 20.5-5.87 1.14-.69 2.55-.39 3.33.74 3.47 5.05 8.5 10.46 14.46 16.12 1.61 1.53 4.14.79 4.88-1.42 7.69-22.8 11.8-46.8 12.2-70.98.05-3.1-2.46-5.65-5.56-5.65h-36.92Z"/><circle cx="41.92" cy="44.03" r="5.5" fill="#fff"/><circle cx="60.84" cy="45.69" r="5.5" fill="#fff"/><path fill="#4a254b" d="M47.48 50.04c-.31-.03-.56.23-.54.54.13 1.92 1.64 3.51 3.61 3.69s3.74-1.13 4.2-3c.07-.3-.13-.6-.44-.63l-6.83-.6Z"/><circle cx="41.92" cy="44.03" r="2.5" fill="#4a254b"/><circle cx="60.84" cy="45.69" r="2.5" fill="#4a254b"/></svg>`,
      
      // Colorful settings
      `<svg viewBox="0 0 48 48" class="svg-bg-element"><path fill="#ffc107" d="M24 22.5C24 16.7 19.3 12 13.5 12S3 16.7 3 22.5c0 0 0 .34 0 .5 0 .55.45 1 1 1s20 0 20 0s0-.45 0-1c0-.16 0-.5 0-.5z"/><path fill="#4caf50" d="M22.5 24C16.7 24 12 28.7 12 34.5S16.7 45 22.5 45c0 0 .34 0 .5 0 .55 0 1-.45 1-1s0-20 0-20s-.45 0-1 0c-.16 0-.5 0-.5 0z"/><path fill="#1976d2" d="M24 25.5C24 31.3 28.7 36 34.5 36S45 31.3 45 25.5c0 0 0-.34 0-.5 0-.55-.45-1-1-1s-20 0-20 0s0 .45 0 1c0 .16 0 .5 0 .5z"/><path fill="#ff3d00" d="M25.5 24C31.3 24 36 19.3 36 13.5S31.3 3 25.5 3c0 0-.34 0-.5 0-.55 0-1 .45-1 1s0 20 0 20s.45 0 1 0c.16 0 .5 0 .5 0z"/></svg>`
    ];

    // Create 12-18 icons
    const iconCount = 12 + Math.floor(Math.random() * 6);
    
    for (let i = 0; i < iconCount; i++) {
      const icon = document.createElement('div');
      icon.innerHTML = svgTemplates[Math.floor(Math.random() * svgTemplates.length)];
      
      const svgElement = icon.firstChild;
      
      // Random positioning
      svgElement.style.left = `${Math.random() * 100}vw`;
      svgElement.style.top = `${Math.random() * 100}vh`;
      
      // Random size (3-8% of viewport width)
      const size = 3 + Math.random() * 5;
      svgElement.style.width = `${size}vw`;
      svgElement.style.height = `${size}vw`;
      
      // Random animation variation
      svgElement.style.animationDuration = `${10 + Math.random() * 20}s`;
      svgElement.style.animationDelay = `${Math.random() * 5}s`;
      
      container.appendChild(svgElement);
    }

    // Cleanup function
    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(5vw, -3vh) rotate(2deg); }
          50% { transform: translate(-5vw, -5vh) rotate(-2deg); }
          75% { transform: translate(3vw, -2vh) rotate(1deg); }
        }
        
        .svg-bg-element {
          position: absolute;
          opacity: 0.1;
          animation: float 15s infinite ease-in-out;
          will-change: transform;
        }
      `}</style>
      
      {/* SVG Background Container */}
      <div 
        ref={containerRef}
        className="fixed top-0 left-0 w-screen h-screen -z-10 pointer-events-none"
      />
    </>
  );
};

export default AnimatedSvgBackground;