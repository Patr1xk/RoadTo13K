import React from 'react';
import { motion } from 'framer-motion';
import { CongestionPrediction, PredictionConfig } from '../types';

interface PredictionOverlayProps {
  zoneId: string;
  width: number;
  height: number;
  prediction: CongestionPrediction;
  config: PredictionConfig;
  className?: string;
}

export const PredictionOverlay: React.FC<PredictionOverlayProps> = ({
  zoneId,
  width,
  height,
  prediction,
  config,
  className = ''
}) => {
  const getSeverityColor = (severity: string) => {
    return config.colors[severity as keyof typeof config.colors] || '#6B7280';
  };

  const getPatternStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)';
      case 'high':
        return 'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.1) 3px, rgba(255,255,255,0.1) 6px)';
      case 'medium':
        return 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)';
      default:
        return 'none';
    }
  };

  const timeToOccur = Math.floor((prediction.predictedTime.getTime() - Date.now()) / 60000);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: config.overlayOpacity, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`absolute inset-0 rounded pointer-events-none ${className}`}
      style={{
        backgroundColor: getSeverityColor(prediction.severity),
        backgroundImage: getPatternStyle(prediction.severity),
        backgroundSize: prediction.severity === 'medium' ? '8px 8px' : 'auto',
        border: `2px dashed ${getSeverityColor(prediction.severity)}`,
        opacity: config.overlayOpacity
      }}
    >
      {/* Prediction indicator */}
      <motion.div
        className="absolute top-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center space-x-1"
        animate={{ 
          opacity: [0.7, 1, 0.7],
          scale: prediction.severity === 'critical' ? [1, 1.05, 1] : 1
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <span>🔮</span>
        <span>+{timeToOccur}min</span>
      </motion.div>

      {/* Risk score indicator */}
      <motion.div
        className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        {Math.round(prediction.probability * 100)}%
      </motion.div>

      {/* Severity pulse effect for high-risk predictions */}
      {(prediction.severity === 'high' || prediction.severity === 'critical') && (
        <motion.div
          className="absolute inset-0 rounded"
          style={{
            border: `3px solid ${getSeverityColor(prediction.severity)}`,
            backgroundColor: 'transparent'
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: prediction.severity === 'critical' ? 1.5 : 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
};