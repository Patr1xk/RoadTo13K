import React from 'react';
import { motion } from 'framer-motion';

interface FlowArrowProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  intensity: 'low' | 'medium' | 'high';
}

export const FlowArrow: React.FC<FlowArrowProps> = ({ from, to, intensity }) => {
  const getArrowColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getArrowWidth = (intensity: string) => {
    switch (intensity) {
      case 'high': return 3;
      case 'medium': return 2;
      default: return 1.5;
    }
  };

  const color = getArrowColor(intensity);
  const strokeWidth = getArrowWidth(intensity);
  
  // Calculate arrow path
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  // Adjust start and end points to not overlap with stations
  const adjustedFrom = {
    x: from.x + (dx / length) * 10,
    y: from.y + (dy / length) * 10
  };
  const adjustedTo = {
    x: to.x - (dx / length) * 10,
    y: to.y - (dy / length) * 10
  };

  return (
    <g>
      {/* Main arrow line */}
      <motion.line
        x1={adjustedFrom.x}
        y1={adjustedFrom.y}
        x2={adjustedTo.x}
        y2={adjustedTo.y}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={intensity === 'high' ? '5,5' : 'none'}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.8 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
      
      {/* Arrow head */}
      <motion.polygon
        points={`${adjustedTo.x},${adjustedTo.y} ${adjustedTo.x - 8},${adjustedTo.y - 4} ${adjustedTo.x - 8},${adjustedTo.y + 4}`}
        fill={color}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.8 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      />
      
      {/* Flow animation dots for high intensity */}
      {intensity === 'high' && (
        <motion.circle
          r="2"
          fill={color}
          initial={{ opacity: 0 }}
          animate={{
            cx: [adjustedFrom.x, adjustedTo.x],
            cy: [adjustedFrom.y, adjustedTo.y],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}
    </g>
  );
};