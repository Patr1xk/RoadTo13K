import React from 'react';
import { motion } from 'framer-motion';
import { TimeDistribution } from '../types';

interface TimeDistributionChartProps {
  distribution: TimeDistribution;
}

export const TimeDistributionChart: React.FC<TimeDistributionChartProps> = ({ distribution }) => {
  const total = distribution.notBusy + distribution.littleBusy + distribution.veryBusy;
  
  const segments = [
    { label: 'Not Busy', value: distribution.notBusy, color: 'bg-green-500', percentage: (distribution.notBusy / total) * 100 },
    { label: 'A Little Busy', value: distribution.littleBusy, color: 'bg-yellow-500', percentage: (distribution.littleBusy / total) * 100 },
    { label: 'Very Busy', value: distribution.veryBusy, color: 'bg-red-500', percentage: (distribution.veryBusy / total) * 100 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <h3 className="text-xl font-bold text-white mb-6">Time Distribution</h3>
      
      <div className="space-y-4">
        {segments.map((segment, index) => (
          <motion.div
            key={segment.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">{segment.label}</span>
              <span className="text-gray-300">{segment.percentage.toFixed(1)}%</span>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-700 rounded-full h-3">
                <motion.div
                  className={`h-3 rounded-full ${segment.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${segment.percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white drop-shadow-lg">
                  {segment.value}h
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Hours</span>
          <span className="text-white font-bold">{total}h</span>
        </div>
      </div>
    </motion.div>
  );
};