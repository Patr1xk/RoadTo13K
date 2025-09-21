import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, AlertTriangle } from 'lucide-react';
import { QueueStationData } from '../types';

interface QueueStationProps {
  station: QueueStationData;
  style?: React.CSSProperties;
}

export const QueueStation: React.FC<QueueStationProps> = ({ station, style }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [prevOccupancy, setPrevOccupancy] = useState(station.occupancy);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'congested': return { 
        bg: 'rgba(239, 68, 68, 0.2)', 
        border: '#ef4444', 
        text: '#fca5a5',
        shadow: '0 0 20px rgba(239, 68, 68, 0.4)'
      };
      case 'busy': return { 
        bg: 'rgba(245, 158, 11, 0.2)', 
        border: '#f59e0b', 
        text: '#fbbf24',
        shadow: '0 0 15px rgba(245, 158, 11, 0.3)'
      };
      default: return { 
        bg: 'rgba(16, 185, 129, 0.2)', 
        border: '#10b981', 
        text: '#6ee7b7',
        shadow: '0 0 10px rgba(16, 185, 129, 0.2)'
      };
    }
  };

  // Track occupancy changes for smooth animations
  React.useEffect(() => {
    setPrevOccupancy(station.occupancy);
  }, [station.occupancy]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'entry': return '🚪';
      case 'checkpoint': return '🔍';
      case 'scanner': return '📡';
      case 'pickup': return '🎒';
      case 'exit': return '✅';
      default: return '📍';
    }
  };

  const colors = getStatusColor(station.status);
  const utilizationRate = (station.occupancy / station.capacity) * 100;

  return (
    <div className="absolute" style={{ left: station.x, top: station.y, ...style }}>
      <motion.div
        className="relative w-32 h-20 rounded-lg border-2 cursor-pointer"
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
          boxShadow: colors.shadow
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        animate={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
          boxShadow: station.status === 'congested' ? 
            ['0 0 10px rgba(239, 68, 68, 0.2)', '0 0 25px rgba(239, 68, 68, 0.6)', '0 0 10px rgba(239, 68, 68, 0.2)'] :
            colors.shadow
        }}
        transition={{ 
          duration: station.status === 'congested' ? 2 : 0.8, 
          repeat: station.status === 'congested' ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {/* Station Content */}
        <div className="p-2 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-lg">{getTypeIcon(station.type)}</span>
            <div className={`w-2 h-2 rounded-full ${colors.border.replace('border-', 'bg-')}`} />
          </div>
          
          <div>
            <div className="text-xs font-bold text-white truncate">{station.name}</div>
            <motion.div 
              className="text-xs font-semibold"
              style={{ color: colors.text }}
              key={station.occupancy}
              initial={{ scale: 1.2, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {station.occupancy}/{station.capacity}
            </motion.div>
          </div>
        </div>

        {/* Queue Length Indicator */}
        {station.queueLength > 0 && (
          <motion.div
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <motion.div 
              className="px-2 py-1 rounded-full text-xs font-bold border"
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
                color: colors.text
              }}
              animate={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
                color: colors.text
              }}
              transition={{ duration: 0.6 }}
            >
              <motion.span
                key={station.queueLength}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {station.queueLength} in queue
              </motion.span>
            </motion.div>
          </motion.div>
        )}

        {/* Congestion Alert */}
        {station.status === 'congested' && (
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </motion.div>
        )}
      </motion.div>

      {/* Detailed Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute z-50 bg-black/90 backdrop-blur-sm rounded-lg p-3 min-w-48 shadow-2xl border border-white/20"
            style={{ left: '50%', top: '100%', transform: 'translateX(-50%)', marginTop: '8px' }}
          >
            <h4 className="font-bold text-white mb-2">{station.name}</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">Occupancy:</span>
                </div>
                <span className="text-white font-semibold">{station.occupancy}/{station.capacity}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">Wait Time:</span>
                </div>
                <span className="text-white font-semibold">{station.waitTime}min</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Queue Length:</span>
                <span className="text-white font-semibold">{station.queueLength} people</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Utilization:</span>
                <span className={`font-semibold ${colors.text}`}>{Math.round(utilizationRate)}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Status:</span>
                <span className={`font-bold capitalize ${colors.text}`}>{station.status}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};