import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, MapPin, Play, Zap } from 'lucide-react';
import { SimulationSession } from '../../types';

interface SessionGridProps {
  /** Array of filtered simulation sessions */
  sessions: SimulationSession[];
  /** Currently selected session ID */
  selectedSession: string | null;
  /** Callback when session is selected */
  onSessionSelect: (sessionId: string) => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Grid display of simulation sessions with preview images and key statistics
 * Provides visual session browsing with immediate selection feedback
 */
export const SessionGrid: React.FC<SessionGridProps> = ({
  sessions,
  selectedSession,
  onSessionSelect,
  isLoading = false
}) => {
  const navigate = useNavigate();

  const handleSessionClick = (sessionId: string) => {
    navigate(`/session/${sessionId}`);
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (sessions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-12 text-center"
      >
        <motion.div 
          className="text-6xl mb-4 opacity-50"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          🔍
        </motion.div>
        <h3 className="text-xl font-bold text-white mb-2">No Sessions Found</h3>
        <p className="text-gray-400">Try adjusting your filters to find simulation sessions</p>
        <motion.div
          className="mt-4 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {sessions.length === 0 ? 'No results match your current filters' : ''}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      layout
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="popLayout">
        {sessions.map((session, index) => {
        const isSelected = selectedSession === session.id;
        
        return (
          <motion.div
            key={session.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.05,
              layout: { duration: 0.3 }
            }}
            className={`
              glass-card cursor-pointer transition-all duration-300 overflow-hidden group
              ${isSelected 
                ? 'border-primary-500/50 bg-primary-500/10 shadow-lg shadow-primary-500/20 ring-2 ring-primary-500/30' 
                : 'border-white/10 hover:border-white/20 hover:bg-white/5 hover:shadow-xl'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => !isLoading && handleSessionClick(session.id)}
            whileHover={!isLoading ? { 
              scale: 1.02, 
              y: -8,
              transition: { duration: 0.2 }
            } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
          >
            {/* Enhanced preview image */}
            <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
              {session.previewImage ? (
                <motion.img
                  src={session.previewImage}
                  alt={`${session.name} preview`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <motion.div 
                  className="w-full h-full flex items-center justify-center"
                  animate={{ 
                    background: isSelected 
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))'
                      : 'linear-gradient(135deg, rgba(75, 85, 99, 1), rgba(55, 65, 81, 1))'
                  }}
                >
                  <MapPin className={`w-12 h-12 transition-colors ${
                    isSelected ? 'text-primary-400' : 'text-gray-500'
                  }`} />
                </motion.div>
              )}
              
              {/* Enhanced overlay with play button */}
              <motion.div 
                className="absolute inset-0 bg-black/20 flex items-center justify-center"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="bg-white/20 backdrop-blur-sm rounded-full p-3"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Play className="w-6 h-6 text-white" />
                </motion.div>
              </motion.div>
              
              {/* Session type badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
                  {session.scenario}
                </span>
              </div>
              
              {/* Enhanced selection indicator */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    className="absolute top-3 right-3 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <motion.div 
                      className="w-3 h-3 bg-white rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  className="absolute inset-0 bg-black/50 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-6 h-6 text-primary-400" />
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* Session details */}
            <div className="p-4 space-y-3">
              {/* Title and location */}
              <div>
                <h3 className="font-semibold text-white text-lg mb-1 truncate">
                  {session.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{session.location}</span>
                </div>
              </div>

              {/* Key statistics */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="font-medium">{formatDate(session.date)}</div>
                    <div className="text-xs text-gray-400">{formatTime(session.date)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-4 h-4 text-green-400" />
                  <div>
                    <div className="font-medium">{session.totalVisitors.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">visitors</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-medium">{session.duration}m</div>
                    <div className="text-xs text-gray-400">duration</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                  <div>
                    <div className="font-medium">{session.maxOccupancy}</div>
                    <div className="text-xs text-gray-400">peak</div>
                  </div>
                </div>
              </div>

              {/* Floorplan info */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Floorplan:</span>
                  <span className="text-white font-medium">{session.floorplan}</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
        })}
      </AnimatePresence>
    </motion.div>
  );
};