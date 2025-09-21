import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, CheckCircle, Circle, Send } from 'lucide-react';
import { CrewMember, OrganizerContact, TrafficRecommendation } from '../types';

interface CrewSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: TrafficRecommendation;
  crewMembers: CrewMember[];
  organizer: OrganizerContact;
  onSendNotification: (recipients: string[], message: string) => void;
}

export const CrewSelectionModal: React.FC<CrewSelectionModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  crewMembers,
  organizer,
  onSendNotification
}) => {
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [message, setMessage] = useState(
    `${recommendation.message}\n\nRecommended Action: ${recommendation.actionRequired}`
  );

  const zoneCrewMembers = crewMembers.filter(crew => 
    crew.assignedZones.includes(recommendation.zoneId)
  );

  const handleSelectAll = () => {
    if (selectedCrew.length === zoneCrewMembers.length) {
      setSelectedCrew([]);
    } else {
      setSelectedCrew(zoneCrewMembers.map(crew => crew.id));
    }
  };

  const handleCrewToggle = (crewId: string) => {
    setSelectedCrew(prev => 
      prev.includes(crewId) 
        ? prev.filter(id => id !== crewId)
        : [...prev, crewId]
    );
  };

  const handleSend = () => {
    onSendNotification(selectedCrew, message);
    onClose();
  };

  const getStatusColor = (status: CrewMember['status']) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'busy': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Send Crew Notification</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Organizer Contact */}
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-300 mb-2">Event Organizer</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="text-white">{organizer.name}</span>
                  <span className="text-gray-400">({organizer.role})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">{organizer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">{organizer.email}</span>
                </div>
              </div>
            </div>

            {/* Zone & Recommendation Info */}
            <div className="mb-6 p-4 bg-white/5 rounded-lg">
              <h3 className="text-sm font-semibold text-white mb-2">Zone: {recommendation.zoneName}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Traffic Level:</span>
                  <span className={`font-medium ${
                    recommendation.severity === 'critical' ? 'text-red-400' :
                    recommendation.severity === 'high' ? 'text-orange-400' :
                    recommendation.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                  }`}>
                    {recommendation.severity.toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Message:</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded text-white text-sm resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Crew Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Assigned Crew ({zoneCrewMembers.length})
                </h3>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {selectedCrew.length === zoneCrewMembers.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="space-y-3">
                {zoneCrewMembers.map(crew => (
                  <motion.div
                    key={crew.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedCrew.includes(crew.id)
                        ? 'bg-blue-500/20 border-blue-500/50'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                    onClick={() => handleCrewToggle(crew.id)}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center gap-3">
                      {selectedCrew.includes(crew.id) ? (
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">{crew.name}</span>
                          <span className="text-sm text-gray-400">({crew.role})</span>
                          <div className={`w-2 h-2 rounded-full ${
                            crew.status === 'online' ? 'bg-green-400' :
                            crew.status === 'busy' ? 'bg-yellow-400' : 'bg-gray-400'
                          }`} />
                          <span className={`text-xs ${getStatusColor(crew.status)}`}>
                            {crew.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-300">
                          <span>{crew.phone}</span>
                          <span>{crew.email}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleSend}
                disabled={selectedCrew.length === 0}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: selectedCrew.length > 0 ? 1.05 : 1 }}
                whileTap={{ scale: selectedCrew.length > 0 ? 0.95 : 1 }}
              >
                <Send className="w-4 h-4" />
                Send to {selectedCrew.length} crew member{selectedCrew.length !== 1 ? 's' : ''}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};