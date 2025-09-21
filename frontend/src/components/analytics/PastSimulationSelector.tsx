import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, ChevronDown, Filter } from 'lucide-react';
import { SimulationSession } from '../../types';

interface PastSimulationSelectorProps {
  /** Array of available simulation sessions */
  sessions: SimulationSession[];
  /** Currently selected session ID */
  selectedSession: string | null;
  /** Callback when session is selected */
  onSessionSelect: (sessionId: string) => void;
  /** Loading state indicator */
  isLoading?: boolean;
}

/**
 * Compact selector for browsing and filtering past simulation sessions
 * Optimized for efficient space usage and immediate session switching
 */
export const PastSimulationSelector: React.FC<PastSimulationSelectorProps> = ({
  sessions,
  selectedSession,
  onSessionSelect,
  isLoading = false
}) => {
  const [filterScenario, setFilterScenario] = useState<string>('all');

  // Get unique scenarios for filtering
  const scenarios = ['all', ...Array.from(new Set(sessions.map(s => s.scenario)))];
  
  // Filter sessions based on selected scenario
  const filteredSessions = filterScenario === 'all' 
    ? sessions 
    : sessions.filter(s => s.scenario === filterScenario);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-3">
      {/* Compact filter header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-300">Sessions ({filteredSessions.length})</h4>
        <select
          value={filterScenario}
          onChange={(e) => setFilterScenario(e.target.value)}
          className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-primary-500 focus:outline-none"
        >
          {scenarios.map(scenario => (
            <option key={scenario} value={scenario} className="bg-gray-800">
              {scenario === 'all' ? 'All' : scenario}
            </option>
          ))}
        </select>
      </div>

      {/* Compact session list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredSessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`
              p-3 rounded-lg border cursor-pointer transition-all duration-200
              ${selectedSession === session.id
                ? 'border-primary-500/50 bg-primary-500/15 shadow-lg shadow-primary-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => !isLoading && onSessionSelect(session.id)}
            whileHover={!isLoading ? { scale: 1.01 } : {}}
            whileTap={!isLoading ? { scale: 0.99 } : {}}
          >
            <div className="flex items-center justify-between mb-2">
              <h6 className="font-medium text-white text-sm truncate">{session.name}</h6>
              <span className="text-xs text-gray-400 ml-2">
                {formatDate(session.date)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 mb-2">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{session.totalVisitors}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{session.duration}m</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded text-xs">
                {session.scenario}
              </span>
              <span className="text-xs text-gray-400">
                {formatTime(session.date)}
              </span>
            </div>
          </motion.div>
        ))}
        
        {filteredSessions.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No sessions found</p>
          </div>
        )}
      </div>
    </div>
  );
};