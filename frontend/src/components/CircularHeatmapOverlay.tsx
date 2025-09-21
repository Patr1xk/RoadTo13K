import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoneHeatmap, HeatmapConfig } from '../types';

interface CircularHeatmapOverlayProps {
  zoneId: string;
  width: number;
  height: number;
  heatmap: ZoneHeatmap;
  config: HeatmapConfig;
  className?: string;
}

export const CircularHeatmapOverlay: React.FC<CircularHeatmapOverlayProps> = ({
  zoneId,
  width,
  height,
  heatmap,
  config,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStable, setIsStable] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !heatmap.points.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create circular heatmap points
    heatmap.points.forEach(point => {
      const x = (point.x / 100) * width;
      const y = (point.y / 100) * height;
      const baseRadius = Math.min(width, height) * 0.08;
      const radius = baseRadius * (0.5 + point.intensity * 0.5);
      
      // Create radial gradient for circular effect
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      
      // Determine color based on intensity
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

      // Extract RGB values
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      
      // Create smooth circular gradient
      const maxAlpha = config.opacity * point.intensity * 0.8;
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${maxAlpha})`);
      gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${maxAlpha * 0.6})`);
      gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${maxAlpha * 0.3})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      // Draw circular heatmap point
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Mark as stable after initial render
    if (!isStable) {
      setTimeout(() => setIsStable(true), 100);
    }
  }, [heatmap, width, height, config, isStable]);

  if (!config.enabled || !heatmap.points.length) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isStable ? 1 : 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`absolute inset-0 pointer-events-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          mixBlendMode: 'multiply',
          filter: `blur(${config.blur}px)`
        }}
      />
    </motion.div>
  );
};