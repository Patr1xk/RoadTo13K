import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Users, Clock } from 'lucide-react';
import { ZoneStats, InteractionCallbacks } from '../../types';

interface SimulationOccupancyTableProps {
  zoneStats: ZoneStats[];
  highlightedZone: string | null;
  interactions: InteractionCallbacks;
  isLoading?: boolean;
}

interface TableRowProps {
  stat: ZoneStats;
  index: number;
  isHighlighted: boolean;
  onHighlight: (zoneId: string | null) => void;
  onSelect: (zoneId: string) => void;
}

const TableRow: React.FC<TableRowProps> = ({
  stat,
  index,
  isHighlighted,
  onHighlight,
  onSelect
}) => {
  const utilizationRate = (stat.occupancy / stat.capacity) * 100;
  
  const getUtilizationColor = (rate: number): string => {
    if (rate > 80) return 'bg-red-500';
    if (rate > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTrendIcon = (trend: ZoneStats['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getBusynessColor = (level: ZoneStats['busynessLevel']): string => {
    switch (level) {
      case 'very-busy': return 'text-red-400 bg-red-500/20';
      case 'little-busy': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-green-400 bg-green-500/20';
    }
  };

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        border-b border-white/5 cursor-pointer transition-all duration-200
        ${isHighlighted ? 'bg-primary-500/20 border-primary-500/50' : 'hover:bg-white/5'}
      `}
      onMouseEnter={() => onHighlight(stat.zoneId)}
      onMouseLeave={() => onHighlight(null)}
      onClick={() => onSelect(stat.zoneId)}
      whileHover={{ scale: 1.01 }}
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-primary-500" />
          <span className="font-medium text-white">{stat.zoneName}</span>
        </div>
      </td>
      
      <td className="py-4 px-4 text-center">
        <span className="text-white font-semibold">{stat.capacity}</span>
      </td>
      
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white font-medium">{stat.occupancy}</span>
              <span className="text-gray-400">{utilizationRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${getUtilizationColor(utilizationRate)}`}
                initial={{ width: 0 }}
                animate={{ width: `${utilizationRate}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
          </div>
        </div>
      </td>
      
      <td className="py-4 px-4 text-center">
        <span className="text-white font-medium">{stat.trafficFlow}</span>
        <div className="text-xs text-gray-400">per min</div>
      </td>
      
      <td className="py-4 px-4 text-center">
        <span className="text-white font-medium">{stat.dwellTime}m</span>
      </td>
      
      <td className="py-4 px-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBusynessColor(stat.busynessLevel)}`}>
          {stat.busynessLevel.replace('-', ' ')}
        </span>
      </td>
      
      <td className="py-4 px-4 text-center">
        {getTrendIcon(stat.trend)}
      </td>
    </motion.tr>
  );
};

export const SimulationOccupancyTable: React.FC<SimulationOccupancyTableProps> = ({
  zoneStats,
  highlightedZone,
  interactions,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-600 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-primary-400" />
          Zone Occupancy Analysis
        </h3>
        <div className="text-sm text-gray-400">
          {zoneStats.length} zones monitored
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Zone</th>
              <th className="text-center py-3 px-4 text-gray-300 font-medium">Capacity</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Occupancy</th>
              <th className="text-center py-3 px-4 text-gray-300 font-medium">Flow Rate</th>
              <th className="text-center py-3 px-4 text-gray-300 font-medium">Dwell Time</th>
              <th className="text-center py-3 px-4 text-gray-300 font-medium">Status</th>
              <th className="text-center py-3 px-4 text-gray-300 font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {zoneStats.map((stat, index) => (
              <TableRow
                key={stat.zoneId}
                stat={stat}
                index={index}
                isHighlighted={highlightedZone === stat.zoneId}
                onHighlight={interactions.onZoneHighlight}
                onSelect={interactions.onZoneSelect}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Low (&lt;60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Medium (60-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>High (&gt;80%)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Real-time data</span>
        </div>
      </div>
    </motion.div>
  );
};