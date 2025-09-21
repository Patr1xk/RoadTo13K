import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Square, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { useVenue } from '../../contexts/VenueContext';

interface AnimatedZoneSelectorProps {
  selectedZones: string[];
  onZoneToggle: (zoneId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export const AnimatedZoneSelector: React.FC<AnimatedZoneSelectorProps> = ({
  selectedZones,
  onZoneToggle,
  onSelectAll,
  onClearAll
}) => {
  const { getCurrentVenue } = useVenue();
  const currentVenue = getCurrentVenue();

  if (!currentVenue) return null;

  const allSelected = selectedZones.length === currentVenue.zones.length;
  const noneSelected = selectedZones.length === 0;

  const getZoneStatus = (zoneId: string) => {
    // Mock zone status - in real app, this would come from props or context
    const statuses = ['normal', 'warning', 'critical'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

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
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <Users className="w-4 h-4" />;
      case 'normal': return <CheckCircle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Select All Controls */}
      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={allSelected ? onClearAll : onSelectAll}
            className="flex items-center gap-2 text-sm font-medium text-white"
          >
            <motion.div
              animate={{ 
                backgroundColor: allSelected ? '#3b82f6' : 'transparent',
                borderColor: allSelected ? '#3b82f6' : '#6b7280'
              }}
              className="w-5 h-5 border-2 rounded flex items-center justify-center"
            >
              <AnimatePresence>
                {allSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CheckSquare className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            {allSelected ? 'Deselect All' : 'Select All'} Zones
          </motion.button>
        </div>
        
        <div className="text-sm text-gray-400">
          {selectedZones.length} of {currentVenue.zones.length} selected
        </div>
      </div>

      {/* Zone Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence>
          {currentVenue.zones.map((zone, index) => {
            const isSelected = selectedZones.includes(zone.id);
            const status = getZoneStatus(zone.id);
            
            return (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onZoneToggle(zone.id)}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/25' 
                    : `${getStatusColor(status)} hover:border-opacity-75`
                }`}
              >
                {/* Selection Indicator */}
                <div className="absolute top-2 right-2">
                  <motion.div
                    animate={{ 
                      scale: isSelected ? 1 : 0.8,
                      backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                      borderColor: isSelected ? '#3b82f6' : '#6b7280'
                    }}
                    className="w-5 h-5 border-2 rounded flex items-center justify-center"
                  >
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CheckSquare className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Zone Content */}
                <div className="pr-8">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(status)}
                    <h4 className="font-semibold text-white text-sm">{zone.name}</h4>
                  </div>
                  
                  <div className="text-xs text-gray-400 capitalize mb-2">{zone.type}</div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium capitalize">{status}</span>
                    <motion.div
                      animate={{ 
                        opacity: isSelected ? 1 : 0.5,
                        scale: isSelected ? 1.1 : 1
                      }}
                      className="text-xs px-2 py-1 bg-white/10 rounded"
                    >
                      {Math.floor(Math.random() * 100) + 50} people
                    </motion.div>
                  </div>
                </div>

                {/* Selection Overlay */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-blue-500/10 rounded-lg pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Selection Summary */}
      <AnimatePresence>
        {!noneSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-300 font-medium">
                {selectedZones.length} zone{selectedZones.length !== 1 ? 's' : ''} selected for notification
              </span>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded"
              >
                Ready to send
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};