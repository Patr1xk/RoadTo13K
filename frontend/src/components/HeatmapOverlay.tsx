import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoneHeatmap, HeatmapConfig } from '../types';

interface HeatmapOverlayProps {
  zoneId: string;
  width: number;
  height: number;
  heatmap: ZoneHeatmap;
  config: HeatmapConfig;
  className?: string;
}

export const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({
  zoneId,
  width,
  height,
  heatmap,
  config,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationKey, setAnimationKey] = useState(0);

  // Smooth heatmap visualization with stable rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !heatmap.points.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear with smooth transition
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    // Create stable gradient for each point
    heatmap.points.forEach(point => {
      const x = (point.x / 100) * width;
      const y = (point.y / 100) * height;
      const radius = Math.max(15, Math.min(width, height) * 0.12);
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      
      let color: string;
      if (point.intensity >= config.intensityThreshold.high) {
        color = config.colors.critical;
      } else if (point.intensity >= config.intensityThreshold.medium) {
        color = config.colors.high;
      } else if (point.intensity >= config.intensityThreshold.low) {
        color = config.colors.medium;
      } else {
        color = config.colors.low;
      }

      // Smoother opacity transitions
      const alpha = Math.min(config.opacity * 0.8, point.intensity * config.opacity * 0.8);
      
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`);
      gradient.addColorStop(1, 'transparent');

      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    setAnimationKey(prev => prev + 1);
  }, [heatmap, width, height, config]);

  if (!config.enabled || !heatmap.points.length) {
    return null;
  }

  return (
    <motion.div
      key={animationKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className={`w-full h-full pointer-events-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded"
        style={{
          width: '100%',
          height: '100%',
          opacity: config.opacity * 0.9,
          mixBlendMode: 'multiply'
        }}
      />
      
      {/* Subtle intensity indicators */}
      {heatmap.points
        .filter(point => point.intensity >= config.intensityThreshold.high)
        .slice(0, 3)
        .map((point, index) => (
          <motion.div
            key={`${point.x}-${point.y}-${index}`}
            className="absolute w-1.5 h-1.5 rounded-full border border-white/30"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              backgroundColor: config.colors.critical,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              delay: index * 0.5
            }}
          />
        ))}
    </motion.div>
  );
};