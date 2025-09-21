import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { FloorPlan, Zone, ZoneStats } from '../types';

interface LiveHeatmapDashboardProps {
  floorPlan: FloorPlan;
  zones: Zone[];
  onBack: () => void;
}

export const LiveHeatmapDashboard: React.FC<LiveHeatmapDashboardProps> = ({
  floorPlan,
  zones,
  onBack
}) => {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [zoneStats, setZoneStats] = useState<ZoneStats[]>([]);

  useEffect(() => {
    // Generate mock stats for zones
    const stats = zones.map(zone => ({
      zoneId: zone.id,
      zoneName: zone.name,
      occupancy: Math.floor(Math.random() * 200) + 10,
      capacity: Math.floor(Math.random() * 100) + 200,
      trafficFlow: Math.floor(Math.random() * 20) + 5,
      dwellTime: Math.floor(Math.random() * 15) + 2,
      busynessLevel: ['not-busy', 'little-busy', 'very-busy'][Math.floor(Math.random() * 3)] as 'not-busy' | 'little-busy' | 'very-busy',
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
    }));
    setZoneStats(stats);
  }, [zones]);

  const getZoneStats = (zoneId: string) => {
    return zoneStats.find(s => s.zoneId === zoneId);
  };

  const getCongestionColor = (level: number) => {
    if (level > 70) return 'bg-red-500';
    if (level > 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const totalPeople = zoneStats.reduce((sum, stat) => sum + stat.occupancy, 0);
  const avgCongestion = zoneStats.reduce((sum, stat) => sum + (stat.occupancy / stat.capacity * 100), 0) / zoneStats.length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="btn-modern bg-gray-700 hover:bg-gray-600">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Live Traffic Dashboard</h1>
            <p className="text-gray-400">Real-time crowd monitoring and analytics</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="glass-card px-4 py-2">
            <div className="text-sm text-gray-400">Total People</div>
            <div className="text-2xl font-bold text-white">{totalPeople}</div>
          </div>
          <div className="glass-card px-4 py-2">
            <div className="text-sm text-gray-400">Avg Congestion</div>
            <div className="text-2xl font-bold text-white">{avgCongestion.toFixed(0)}%</div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Heatmap */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-3 glass-card p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Interactive Heatmap</h3>
          <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '500px' }}>
            {/* Floorplan background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-50" />
            
            {/* Heatmap overlay */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <radialGradient id="heatGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(239, 68, 68, 0.8)" />
                  <stop offset="50%" stopColor="rgba(245, 158, 11, 0.6)" />
                  <stop offset="100%" stopColor="rgba(59, 130, 246, 0.3)" />
                </radialGradient>
              </defs>
              
              {/* Heat points */}
              {Array.from({ length: 20 }).map((_, i) => (
                <circle
                  key={i}
                  cx={Math.random() * 100 + '%'}
                  cy={Math.random() * 100 + '%'}
                  r={Math.random() * 30 + 10}
                  fill="url(#heatGradient)"
                  opacity={Math.random() * 0.7 + 0.3}
                />
              ))}
            </svg>
            
            {/* Zone overlays */}
            {zones.map(zone => {
              const stats = getZoneStats(zone.id);
              const isHovered = hoveredZone === zone.id;
              
              return (
                <div key={zone.id} className="absolute">
                  <div
                    className="border-2 rounded cursor-pointer transition-all duration-200"
                    style={{
                      left: zone.x,
                      top: zone.y,
                      width: zone.width,
                      height: zone.height,
                      borderColor: zone.color,
                      backgroundColor: isHovered ? `${zone.color}40` : `${zone.color}20`
                    }}
                    onMouseEnter={() => setHoveredZone(zone.id)}
                    onMouseLeave={() => setHoveredZone(null)}
                  >
                    <div className="absolute top-2 left-2 bg-gray-900/80 px-2 py-1 rounded text-xs text-white">
                      {zone.name}
                    </div>
                  </div>
                  
                  {/* Hover card */}
                  <AnimatePresence>
                    {isHovered && stats && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className="absolute z-50 glass-card p-4 min-w-48"
                        style={{
                          left: zone.x + zone.width + 10,
                          top: zone.y
                        }}
                      >
                        <h4 className="font-semibold text-white mb-3">{zone.name}</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Occupancy</span>
                            <span className="text-white font-medium">{stats.occupancy}/{stats.capacity}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Dwell Time</span>
                            <span className="text-white font-medium">{stats.dwellTime}m</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Traffic Flow</span>
                            <span className="text-white font-medium">{stats.trafficFlow}/min</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Status</span>
                            <span className="text-white font-medium capitalize">{stats.busynessLevel.replace('-', ' ')}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Stats Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="glass-card p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Zone Summary</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {zoneStats.map(stat => {
                const zone = zones.find(z => z.id === stat.zoneId);
                if (!zone) return null;
                
                return (
                  <div key={stat.zoneId} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: zone.color }}
                      />
                      <span className="text-white font-medium text-sm">{zone.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <Users className="w-3 h-3 text-blue-400 inline mr-1" />
                        <span className="text-gray-400">{stat.occupancy}</span>
                      </div>
                      <div>
                        <Clock className="w-3 h-3 text-purple-400 inline mr-1" />
                        <span className="text-gray-400">{stat.dwellTime}m</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Occupancy</span>
                        <span className="text-white">{((stat.occupancy / stat.capacity) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${getCongestionColor((stat.occupancy / stat.capacity) * 100)}`}
                          style={{ width: `${(stat.occupancy / stat.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};