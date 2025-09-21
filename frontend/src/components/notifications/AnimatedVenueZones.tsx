import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Clock, 
  TrendingUp, 
  Send,
  Eye,
  BarChart3
} from 'lucide-react';
import { useVenue } from '../../contexts/VenueContext';

interface ZoneAnalytics {
  id: string;
  name: string;
  type: string;
  occupancy: number;
  capacity: number;
  waitTime: number;
  throughput: number;
  status: 'normal' | 'warning' | 'critical';
  lastNotified?: Date;
  insights: string[];
}

interface AnimatedVenueZonesProps {
  onZoneNotification: (zoneId: string, message: string) => void;
  onViewZoneDetails: (zoneId: string) => void;
}

export const AnimatedVenueZones: React.FC<AnimatedVenueZonesProps> = ({
  onZoneNotification,
  onViewZoneDetails
}) => {
  const { getCurrentVenue, selectedZone, setSelectedZone } = useVenue();
  const [sendingNotification, setSendingNotification] = useState<string | null>(null);
  
  const currentVenue = getCurrentVenue();

  const generateZoneAnalytics = (): ZoneAnalytics[] => {
    if (!currentVenue) return [];

    return currentVenue.zones.map(zone => {
      const occupancy = Math.floor(Math.random() * 150) + 50;
      const capacity = Math.floor(Math.random() * 50) + 100;
      const utilizationRate = (occupancy / capacity) * 100;
      
      let status: 'normal' | 'warning' | 'critical' = 'normal';
      if (utilizationRate > 90) status = 'critical';
      else if (utilizationRate > 75) status = 'warning';

      const insights = [];
      if (status === 'critical') {
        insights.push('Immediate attention required', 'Deploy additional staff');
      } else if (status === 'warning') {
        insights.push('Monitor closely', 'Prepare contingency measures');
      } else {
        insights.push('Operating normally');
      }

      return {
        id: zone.id,
        name: zone.name,
        type: zone.type,
        occupancy,
        capacity,
        waitTime: Math.floor(Math.random() * 15) + 2,
        throughput: Math.floor(Math.random() * 100) + 20,
        status,
        insights
      };
    });
  };

  const zoneAnalytics = generateZoneAnalytics();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'border-red-500/50 bg-red-500/10 text-red-300';
      case 'warning': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300';
      case 'normal': return 'border-green-500/50 bg-green-500/10 text-green-300';
      default: return 'border-gray-500/50 bg-gray-500/10 text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'warning': return <Users className="w-5 h-5 text-yellow-400" />;
      case 'normal': return <CheckCircle className="w-5 h-5 text-green-400" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleSendNotification = async (zoneId: string) => {
    setSendingNotification(zoneId);
    
    // Simulate notification sending
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const zone = zoneAnalytics.find(z => z.id === zoneId);
    if (zone) {
      onZoneNotification(zoneId, `Alert for ${zone.name}: ${zone.insights[0]}`);
    }
    
    setSendingNotification(null);
  };

  if (!currentVenue) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8 text-center">
        <div className="text-gray-400">Select a venue to view zone analytics</div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Zone Analytics</h3>
          <p className="text-sm text-gray-400">{currentVenue.name} • {zoneAnalytics.length} zones</p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>{zoneAnalytics.filter(z => z.status === 'normal').length} Normal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>{zoneAnalytics.filter(z => z.status === 'warning').length} Warning</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span>{zoneAnalytics.filter(z => z.status === 'critical').length} Critical</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {zoneAnalytics.map((zone, index) => {
            const isSelected = selectedZone === zone.id;
            const isSending = sendingNotification === zone.id;
            const utilizationRate = (zone.occupancy / zone.capacity) * 100;

            return (
              <motion.div
                key={zone.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => setSelectedZone(zone.id)}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-500/20 shadow-xl shadow-blue-500/25' 
                    : `${getStatusColor(zone.status)} hover:shadow-lg`
                }`}
              >
                {/* Zone Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(zone.status)}
                    <h4 className="font-semibold text-white text-sm">{zone.name}</h4>
                  </div>
                  <div className="text-xs text-gray-400 capitalize">{zone.type}</div>
                </div>

                {/* Occupancy Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Occupancy</span>
                    <span className="text-xs font-medium text-white">
                      {zone.occupancy}/{zone.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(utilizationRate, 100)}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className={`h-2 rounded-full ${
                        utilizationRate > 90 ? 'bg-red-400' :
                        utilizationRate > 75 ? 'bg-yellow-400' : 'bg-green-400'
                      }`}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {utilizationRate.toFixed(0)}% capacity
                  </div>
                </div>

                {/* Zone Metrics */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="text-center p-2 bg-white/5 rounded">
                    <Clock className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                    <div className="text-xs text-gray-400">Wait Time</div>
                    <div className="text-sm font-medium text-white">{zone.waitTime}min</div>
                  </div>
                  <div className="text-center p-2 bg-white/5 rounded">
                    <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-400" />
                    <div className="text-xs text-gray-400">Throughput</div>
                    <div className="text-sm font-medium text-white">{zone.throughput}/hr</div>
                  </div>
                </div>

                {/* Zone Insights */}
                <div className="mb-4">
                  <div className="text-xs text-gray-400 mb-1">Key Insights:</div>
                  <div className="space-y-1">
                    {zone.insights.slice(0, 2).map((insight, i) => (
                      <div key={i} className="text-xs text-gray-300 truncate">
                        • {insight}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewZoneDetails(zone.id);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs hover:bg-blue-500/30 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    Details
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendNotification(zone.id);
                    }}
                    disabled={isSending}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    {isSending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-3 h-3 border border-red-300 border-t-transparent rounded-full"
                      />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                    {isSending ? 'Sending...' : 'Alert'}
                  </motion.button>
                </div>

                {/* Selection Indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <BarChart3 className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Notification Feedback */}
                <AnimatePresence>
                  {isSending && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-blue-500/20 rounded-xl flex items-center justify-center"
                    >
                      <div className="text-sm font-medium text-blue-300">Sending notification...</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};