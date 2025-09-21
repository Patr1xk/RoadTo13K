import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Send } from 'lucide-react';
import { TrafficRecommendation } from '../types';

interface ZoneRecommendationAlertProps {
  recommendation: TrafficRecommendation;
  onSendRecommendation: (recommendation: TrafficRecommendation) => void;
}

export const ZoneRecommendationAlert: React.FC<ZoneRecommendationAlertProps> = ({
  recommendation,
  onSendRecommendation
}) => {
  const getSeverityColor = () => {
    switch (recommendation.severity) {
      case 'critical': return 'bg-red-500/90 border-red-400';
      case 'high': return 'bg-orange-500/90 border-orange-400';
      case 'medium': return 'bg-yellow-500/90 border-yellow-400';
      default: return 'bg-blue-500/90 border-blue-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`absolute bottom-2 left-2 right-2 p-2 rounded border backdrop-blur-sm ${getSeverityColor()}`}
      style={{ zIndex: 100 }}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white font-medium leading-tight">
            {recommendation.message}
          </p>
        </div>
        <motion.button
          onClick={() => onSendRecommendation(recommendation)}
          className="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1 flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send className="w-3 h-3" />
          Send
        </motion.button>
      </div>
    </motion.div>
  );
};