import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { QueueStationData } from '../types';

interface QueueStatsTableProps {
  stations: QueueStationData[];
}

export const QueueStatsTable: React.FC<QueueStatsTableProps> = ({ stations }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'congested': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'busy': return <TrendingUp className="w-4 h-4 text-yellow-400" />;
      default: return <Users className="w-4 h-4 text-green-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'congested': return 'text-red-400 bg-red-500/10';
      case 'busy': return 'text-yellow-400 bg-yellow-500/10';
      default: return 'text-green-400 bg-green-500/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4">Queue Station Metrics</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Station</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Occupancy</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Queue Length</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Wait Time</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Utilization</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((station, index) => {
              const utilizationRate = (station.occupancy / station.capacity) * 100;
              
              return (
                <motion.tr
                  key={station.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {station.type === 'entry' ? '🚪' :
                         station.type === 'checkpoint' ? '🔍' :
                         station.type === 'scanner' ? '📡' :
                         station.type === 'pickup' ? '🎒' : '✅'}
                      </span>
                      <span className="text-white font-medium">{station.name}</span>
                    </div>
                  </td>
                  
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-white">{station.occupancy}/{station.capacity}</span>
                    </div>
                  </td>
                  
                  <td className="py-3 px-4">
                    <span className="text-white font-medium">{station.queueLength}</span>
                    <span className="text-gray-400 text-sm ml-1">people</span>
                  </td>
                  
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-white">{station.waitTime}</span>
                      <span className="text-gray-400 text-sm">min</span>
                    </div>
                  </td>
                  
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${
                            utilizationRate > 80 ? 'bg-red-500' :
                            utilizationRate > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${utilizationRate}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                      <span className="text-white text-sm">{Math.round(utilizationRate)}%</span>
                    </div>
                  </td>
                  
                  <td className="py-3 px-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(station.status)}`}>
                      {getStatusIcon(station.status)}
                      <span className="text-sm font-medium capitalize">{station.status}</span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};