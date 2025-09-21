import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, AlertTriangle } from 'lucide-react';
import { AreaStats } from '../types';

interface StatsPanelProps {
  stats: AreaStats[];
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return '🔴';
      case 'warning': return '🟡';
      default: return '🟢';
    }
  };

  return (
    <motion.div 
      className="glass-card p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-2xl">📊</span>
        Area Statistics
      </h3>
      
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="glass-card p-4 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                {stat.area}
              </h4>
              <span className="text-xl">{getStatusIcon(stat.status)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-sm text-gray-400">People</div>
                  <div className="font-bold text-white">{stat.people}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="text-sm text-gray-400">Wait Time</div>
                  <div className="font-bold text-white">{stat.congestionTime}min</div>
                </div>
              </div>
            </div>
            
            <div className={`
              px-3 py-2 rounded-lg border text-center font-semibold text-sm uppercase tracking-wide
              ${getStatusColor(stat.status)}
            `}>
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {stat.status}
              </div>
            </div>
            
            {/* Progress bar for congestion level */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Congestion Level</span>
                <span>{Math.min(100, (stat.congestionTime / 15) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${
                    stat.status === 'critical' ? 'bg-red-500' :
                    stat.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (stat.congestionTime / 15) * 100)}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};