import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ZoneStats } from '../types';

interface StatsTableProps {
  zoneStats: ZoneStats[];
}

export const StatsTable: React.FC<StatsTableProps> = ({ zoneStats }) => {
  const getBusynessColor = (level: string) => {
    switch (level) {
      case 'very-busy': return 'bg-red-500';
      case 'little-busy': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <h3 className="text-xl font-bold text-white mb-6">Zone Analytics</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Zone</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Occupancy</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Traffic Flow</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Dwell Time</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Busyness</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {zoneStats.map((zone, index) => (
              <motion.tr
                key={zone.zoneId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="font-medium text-white">{zone.zoneName}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white">{zone.occupancy}</span>
                        <span className="text-gray-400">/{zone.capacity}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(zone.occupancy / zone.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-white font-medium">{zone.trafficFlow}/min</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-white font-medium">{zone.dwellTime}m</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getBusynessColor(zone.busynessLevel)}`} />
                    <span className="text-white text-sm capitalize">
                      {zone.busynessLevel.replace('-', ' ')}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  {getTrendIcon(zone.trend)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};