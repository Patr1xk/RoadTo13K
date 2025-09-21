import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { BusynessInterval } from '../../types';

interface BusynessDistributionBarProps {
  intervals: BusynessInterval[];
  totalHours: number;
  isAnimated?: boolean;
  onSegmentHover?: (interval: BusynessInterval | null) => void;
  onSegmentClick?: (interval: BusynessInterval) => void;
}

interface SegmentProps {
  interval: BusynessInterval;
  index: number;
  isAnimated: boolean;
  onHover: (interval: BusynessInterval | null) => void;
  onClick: (interval: BusynessInterval) => void;
}

const Segment: React.FC<SegmentProps> = ({
  interval,
  index,
  isAnimated,
  onHover,
  onClick
}) => {
  return (
    <motion.div
      className="relative cursor-pointer group"
      style={{ width: `${interval.percentage}%` }}
      initial={isAnimated ? { width: 0 } : false}
      animate={{ width: `${interval.percentage}%` }}
      transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
      onMouseEnter={() => onHover(interval)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(interval)}
      whileHover={{ scale: 1.02 }}
    >
      <div
        className="h-full transition-all duration-200 group-hover:brightness-110"
        style={{ backgroundColor: interval.color }}
      />
      
      {/* Segment label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-sm font-medium drop-shadow-lg">
          {interval.percentage > 15 ? `${interval.value}h` : ''}
        </span>
      </div>
      
      {/* Hover tooltip */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
          <div className="font-medium">{interval.label}</div>
          <div className="text-xs text-gray-300">
            {interval.value}h ({interval.percentage.toFixed(1)}%)
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const BusynessDistributionBar: React.FC<BusynessDistributionBarProps> = ({
  intervals,
  totalHours,
  isAnimated = true,
  onSegmentHover,
  onSegmentClick
}) => {
  const handleSegmentHover = (interval: BusynessInterval | null) => {
    onSegmentHover?.(interval);
  };

  const handleSegmentClick = (interval: BusynessInterval) => {
    onSegmentClick?.(interval);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 h-fit"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary-400" />
          Busyness Distribution
        </h3>
        <div className="text-sm text-gray-400">
          Total: {totalHours}h
        </div>
      </div>

      {/* Main distribution bar */}
      <div className="mb-4">
        <div className="flex rounded-lg overflow-hidden border border-white/10 shadow-lg h-10">
          {intervals.map((interval, index) => (
            <Segment
              key={interval.label}
              interval={interval}
              index={index}
              isAnimated={isAnimated}
              onHover={handleSegmentHover}
              onClick={handleSegmentClick}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {intervals.map((interval, index) => (
          <motion.div
            key={interval.label}
            initial={isAnimated ? { opacity: 0, x: -20 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => handleSegmentClick(interval)}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: interval.color }}
              />
              <span className="text-white font-medium">{interval.label}</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-300">{interval.value}h</span>
              <span className="text-white font-semibold">
                {interval.percentage.toFixed(1)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary statistics */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">
              {intervals.find(i => i.label.includes('Not'))?.percentage.toFixed(0) || 0}%
            </div>
            <div className="text-xs text-gray-400">Low Activity</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {intervals.find(i => i.label.includes('Little'))?.percentage.toFixed(0) || 0}%
            </div>
            <div className="text-xs text-gray-400">Moderate Activity</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">
              {intervals.find(i => i.label.includes('Very'))?.percentage.toFixed(0) || 0}%
            </div>
            <div className="text-xs text-gray-400">High Activity</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};