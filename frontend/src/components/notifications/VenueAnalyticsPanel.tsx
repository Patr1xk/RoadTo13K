import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { useVenue } from '../../contexts/VenueContext';
import { AnimatedZoneSelector } from './AnimatedZoneSelector';
import { AnimatedVenueZones } from './AnimatedVenueZones';

interface VenueAnalyticsPanelProps {
  onNotificationSent: (message: string, zones: string[]) => void;
}

export const VenueAnalyticsPanel: React.FC<VenueAnalyticsPanelProps> = ({
  onNotificationSent
}) => {
  const { getCurrentVenue } = useVenue();
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showNotificationForm, setShowNotificationForm] = useState(false);

  const currentVenue = getCurrentVenue();

  const handleZoneToggle = (zoneId: string) => {
    setSelectedZones(prev => 
      prev.includes(zoneId) 
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  };

  const handleSelectAllZones = () => {
    if (currentVenue) {
      setSelectedZones(currentVenue.zones.map(z => z.id));
    }
  };

  const handleClearAllZones = () => {
    setSelectedZones([]);
  };

  const handleSendNotification = () => {
    if (notificationMessage.trim() && selectedZones.length > 0) {
      onNotificationSent(notificationMessage, selectedZones);
      setNotificationMessage('');
      setSelectedZones([]);
      setShowNotificationForm(false);
    }
  };

  const handleZoneNotification = (zoneId: string, message: string) => {
    onNotificationSent(message, [zoneId]);
  };

  const handleViewZoneDetails = (zoneId: string) => {
    // Could navigate to detailed zone view or expand zone details
    console.log('View details for zone:', zoneId);
  };

  return (
    <div className="space-y-6">
      {/* Animated Venue Zones */}
      <AnimatedVenueZones 
        onZoneNotification={handleZoneNotification}
        onViewZoneDetails={handleViewZoneDetails}
      />
      
      {/* Zone Selection for Bulk Notifications */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Bulk Notification Center</h3>
          <button
            onClick={() => {
              if (currentVenue) {
                setSelectedZones(currentVenue.zones.map(z => z.id));
                setNotificationMessage(`URGENT: Immediate attention required across all zones in ${currentVenue.name}`);
                setShowNotificationForm(true);
              }
            }}
            disabled={!currentVenue}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white rounded-lg transition-colors font-semibold shadow-lg"
          >
            <Send className="w-5 h-5" />
            Emergency Broadcast
          </button>
        </div>
        
        <AnimatedZoneSelector
          selectedZones={selectedZones}
          onZoneToggle={handleZoneToggle}
          onSelectAll={handleSelectAllZones}
          onClearAll={handleClearAllZones}
        />
        
        {selectedZones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <button
              onClick={() => setShowNotificationForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
            >
              <Send className="w-4 h-4" />
              Send Custom Notification to {selectedZones.length} Zone{selectedZones.length !== 1 ? 's' : ''}
            </button>
          </motion.div>
        )}
      </div>

      {/* Notification Form Modal */}
      <AnimatePresence>
        {showNotificationForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={(e) => e.target === e.currentTarget && setShowNotificationForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">Send Notification</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Zones ({selectedZones.length} selected)
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    <button
                      onClick={handleSelectAllZones}
                      className="w-full text-left px-3 py-2 bg-blue-500/20 text-blue-300 rounded text-sm hover:bg-blue-500/30"
                    >
                      Select All Zones
                    </button>
                    {currentVenue?.zones.map(zone => (
                      <label key={zone.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedZones.includes(zone.id)}
                          onChange={() => handleZoneToggle(zone.id)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-300">{zone.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <textarea
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="Enter notification message..."
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white resize-none"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleSendNotification}
                    disabled={!notificationMessage.trim() || selectedZones.length === 0}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors"
                  >
                    Send Notification
                  </button>
                  <button
                    onClick={() => setShowNotificationForm(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};