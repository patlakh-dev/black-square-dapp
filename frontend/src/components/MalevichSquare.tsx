import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

type MalevichSquareProps = {
  size?: number;
};

export function MalevichSquare({ size = 320 }: MalevichSquareProps) {
  // const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      setMouseCoords({ x: e.clientX, y: e.clientY });

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      );

      // Check if mouse is within 200px of the square
      const maxDistance = 200;
      setIsHovering(distance < maxDistance);

      if (distance < maxDistance) {
        setMousePosition({
          x: e.clientX - centerX,
          y: e.clientY - centerY,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate zonal glow for red rectangle (like gray squares)
  const getRedRectGlow = () => {
    if (!isHovering || !containerRef.current) {
      return { borderColor: 'rgba(210, 4, 45, 0.2)', boxShadow: 'none' };
    }

    const rect = containerRef.current.getBoundingClientRect();
    // Red rectangle position: -bottom-6 -right-10, w-32 (128px) h-16 (64px)
    const redRectLeft = rect.right - 128 - 40;
    const redRectRight = rect.right - 40;
    const redRectTop = rect.bottom - 64 - 24;
    const redRectBottom = rect.bottom - 24;

    const mouseX = mouseCoords.x;
    const mouseY = mouseCoords.y;

    // Calculate distance to each edge
    const distToLeft = Math.abs(mouseX - redRectLeft);
    const distToRight = Math.abs(mouseX - redRectRight);
    const distToTop = Math.abs(mouseY - redRectTop);
    const distToBottom = Math.abs(mouseY - redRectBottom);

    // Find minimum distance to any edge
    const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
    const maxDistance = 120;

    if (minDist > maxDistance) {
      return { borderColor: 'rgba(210, 4, 45, 0.2)', boxShadow: 'none' };
    }

    // Calculate proximity-based intensity (zonal effect)
    const proximity = 1 - minDist / maxDistance;
    const intensity = 0.2 + proximity * 0.25; // Further reduced for subtler glow

    // Determine which edge is closest for shadow offset
    let shadowX = 0;
    let shadowY = 0;
    if (minDist === distToLeft) shadowX = -20;
    else if (minDist === distToRight) shadowX = 20;
    else if (minDist === distToTop) shadowY = -20;
    else shadowY = 20;

    // Calculate zonal border color - brighter on closest edge
    // Use gradient-like effect by calculating intensity per edge
    const edgeIntensities = {
      left: distToLeft < maxDistance ? 0.2 + (1 - distToLeft / maxDistance) * 0.25 : 0.2,
      right: distToRight < maxDistance ? 0.2 + (1 - distToRight / maxDistance) * 0.25 : 0.2,
      top: distToTop < maxDistance ? 0.2 + (1 - distToTop / maxDistance) * 0.25 : 0.2,
      bottom: distToBottom < maxDistance ? 0.2 + (1 - distToBottom / maxDistance) * 0.25 : 0.2,
    };

    // Use the maximum intensity for the border (closest edge glows)
    const maxIntensity = Math.max(...Object.values(edgeIntensities));

    return {
      borderColor: `rgba(210, 4, 45, ${maxIntensity})`,
      boxShadow: proximity > 0.3
        ? `${shadowX}px ${shadowY}px ${30 * intensity}px rgba(210, 4, 45, ${intensity}), ${shadowX}px ${shadowY}px ${60 * intensity}px rgba(210, 4, 45, ${intensity * 0.5})`
        : 'none',
    };
  };

  const glowStyle = getRedRectGlow();

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ width: size, height: size }}
      aria-label="Black Square composition"
    >
      <div className="absolute inset-8 border border-ivory/10" />
      <div className="absolute inset-0 bg-black shadow-[0_40px_80px_rgba(0,0,0,0.65)]" />
      <motion.div
        className="absolute -bottom-6 -right-10 h-16 w-32 border"
        style={{
          borderColor: glowStyle.borderColor,
          boxShadow: glowStyle.boxShadow,
        }}
        animate={{
          borderColor: glowStyle.borderColor,
          boxShadow: glowStyle.boxShadow,
        }}
        transition={{
          duration: 0.2,
          ease: 'easeOut',
        }}
      />
      <div className="absolute -top-8 -left-6 h-10 w-10 border border-ivory/30" />
    </div>
  );
}

