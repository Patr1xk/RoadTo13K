import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';
import { SimulationSession } from '../types';

interface PastSimulationsListProps {
  sessions: SimulationSession[];
  selectedSession: string | null;
  onSessionSelect: (sessionId: string) => void;
}

export const PastSimulationsList: React.FC<PastSimulationsListProps> = ({
  sessions,
  selectedSession,
  onSessionSelect
}) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card p-6"
    >
      <h3 className="text-xl font-bold text-white mb-6">Simulation History</h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02]
              ${selectedSession === session.id
                ? 'border-primary-400 bg-primary-500/20 shadow-lg shadow-primary-500/20'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
              }
            `}
            onClick={() => onSessionSelect(session.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white">{session.name}</h4>
              {selectedSession === session.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-1 rounded-full bg-primary-500"
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(session.date)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-4 h-4" />
                <span>{formatTime(session.date)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-300">
                <Users className="w-4 h-4" />
                <span>{session.totalVisitors} visitors</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-4 h-4" />
                <span>{session.duration}min</span>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                  {session.scenario}
                </span>
                <div className="text-gray-400">
                  Avg: {session.avgDuration}m | Peak: {session.peakTime}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};