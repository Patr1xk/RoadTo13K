import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Bell, Settings, Users, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { NotificationSettings } from '../components/analytics/NotificationSettings';
import { RecommendationInsights } from '../components/analytics/RecommendationInsights';
import { CrewSelectionModal } from '../components/CrewSelectionModal';
import { ContactManager } from '../components/notifications/ContactManager';
import { VenueTopSelector } from '../components/notifications/VenueTopSelector';
import { VenueSelector } from '../components/notifications/VenueSelector';
import { AggregatedInsightsPanel } from '../components/notifications/AggregatedInsightsPanel';
import { VenueAnalyticsPanel } from '../components/notifications/VenueAnalyticsPanel';
import { InteractiveCrewChart } from '../components/notifications/InteractiveCrewChart';
import { VenueProvider, useVenue } from '../contexts/VenueContext';
import { useRecommendationEngine } from '../hooks/useRecommendationEngine';
import { useContacts } from '../hooks/useContacts';
import { 
  NotificationSettings as NotificationSettingsType, 
  RecommendationInsight, 
  CrewMember, 
  OrganizerContact,
  Zone,
  ZoneStats,
  NotificationPayload
} from '../types';

// Mock data
const mockZones: Zone[] = [
  { id: '1', name: 'Main Entrance', x: 50, y: 280, width: 120, height: 60, type: 'entrance', color: '#22c55e' },
  { id: '2', name: 'North Entrance', x: 390, y: 50, width: 120, height: 60, type: 'entrance', color: '#22c55e' },
  { id: '3', name: 'Upper Seating', x: 200, y: 140, width: 500, height: 100, type: 'seating', color: '#3b82f6' },
  { id: '4', name: 'Lower Seating', x: 200, y: 360, width: 500, height: 100, type: 'seating', color: '#3b82f6' },
  { id: '5', name: 'North Concourse', x: 100, y: 250, width: 200, height: 80, type: 'concourse', color: '#8b5cf6' },
  { id: '6', name: 'South Concourse', x: 600, y: 250, width: 200, height: 80, type: 'concourse', color: '#8b5cf6' }
];

const mockZoneStats: ZoneStats[] = mockZones.map(zone => {
  const occupancy = Math.floor(Math.random() * 150) + 50;
  const capacity = Math.floor(Math.random() * 100) + 100;
  return {
    zoneId: zone.id,
    zoneName: zone.name,
    occupancy,
    capacity,
    trafficFlow: Math.floor(Math.random() * 40) + 10,
    dwellTime: Math.floor(Math.random() * 20) + 5,
    busynessLevel: ['not-busy', 'little-busy', 'very-busy'][Math.floor(Math.random() * 3)] as 'not-busy' | 'little-busy' | 'very-busy',
    trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
    utilizationRate: (occupancy / capacity) * 100
  };
});

const mockCrewMembers: CrewMember[] = [
  { id: '1', name: 'John Smith', role: 'Security Lead', phone: '+1-555-0101', email: 'john.smith@venue.com', status: 'online', assignedZones: ['1', '2'], lastSeen: new Date() },
  { id: '2', name: 'Sarah Johnson', role: 'Crowd Control', phone: '+1-555-0102', email: 'sarah.j@venue.com', status: 'online', assignedZones: ['3', '4'], lastSeen: new Date() },
  { id: '3', name: 'Mike Chen', role: 'Safety Officer', phone: '+1-555-0103', email: 'mike.chen@venue.com', status: 'busy', assignedZones: ['5', '6'], lastSeen: new Date() }
];

const mockOrganizer: OrganizerContact = {
  name: 'David Wilson',
  role: 'Event Manager',
  phone: '+1-555-0100',
  email: 'david.wilson@venue.com',
  department: 'Operations'
};

const UnifiedNotificationsContent: React.FC = () => {
  const location = useLocation();
  const prefilledRecommendation = location.state?.prefilledRecommendation as RecommendationInsight | undefined;
  
  const [activeTab, setActiveTab] = useState<'insights' | 'venue-insights' | 'contacts' | 'settings'>('insights');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsType>({
    enabled: true,
    channels: { whatsapp: true, email: true, sms: false },
    thresholds: { occupancyRate: 80, trafficFlow: 25, dwellTime: 10 },
    zoneSpecific: {}
  });

  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationInsight | null>(null);
  const [showCrewModal, setShowCrewModal] = useState(false);
  const [sentNotifications, setSentNotifications] = useState<string[]>([]);
  const [highlightedRecommendation, setHighlightedRecommendation] = useState<string | null>(null);
  const [venueNotificationHistory, setVenueNotificationHistory] = useState<Array<{
    id: string;
    message: string;
    zones: string[];
    timestamp: Date;
  }>>([]);

  const { contacts, loading: contactsLoading, addContact, updateContact, deleteContact } = useContacts();
  const { setSelectedVenue } = useVenue();
  const recommendationInsights = useRecommendationEngine(mockZoneStats, notificationSettings);
  
  // Handle prefilled recommendation from navigation
  useEffect(() => {
    if (prefilledRecommendation) {
      setHighlightedRecommendation(prefilledRecommendation.id);
      // Auto-open crew modal for prefilled recommendation
      setTimeout(() => {
        setSelectedRecommendation(prefilledRecommendation);
        setShowCrewModal(true);
      }, 500);
    }
  }, [prefilledRecommendation]);

  const handleSendNotification = async (insight: RecommendationInsight) => {
    setSelectedRecommendation(insight);
    setShowCrewModal(true);
  };

  const handleCrewNotification = async (recipients: string[], message: string) => {
    // Simulate AWS SNS notification
    console.log('Sending WhatsApp notification via AWS SNS:', { recipients, message });
    
    // Mark as sent
    if (selectedRecommendation) {
      setSentNotifications(prev => [...prev, selectedRecommendation.id]);
    }
    
    setShowCrewModal(false);
    setSelectedRecommendation(null);
  };

  const handleViewVenueDetails = (venueId: string) => {
    setSelectedVenue(venueId);
    setActiveTab('venue-insights');
  };

  const handleVenueNotificationSent = (message: string, zones: string[]) => {
    const notification = {
      id: Date.now().toString(),
      message,
      zones,
      timestamp: new Date()
    };
    setVenueNotificationHistory(prev => [notification, ...prev].slice(0, 10));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Unified Notification System</h1>
        <p className="text-gray-400 text-lg">Complete notification management, contacts, and venue insights</p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
        {[
          { id: 'insights', label: 'Live Insights', icon: '📊' },
          { id: 'venue-insights', label: 'Venue Analytics', icon: '🏢' },
          { id: 'contacts', label: 'Contact Management', icon: '👥' },
          { id: 'settings', label: 'Settings & Status', icon: '⚙️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <VenueTopSelector />
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3">
                <AggregatedInsightsPanel onViewDetails={handleViewVenueDetails} />
              </div>
            
            <div className="space-y-6">
              <InteractiveCrewChart />
              
              {venueNotificationHistory.length > 0 && (
                <motion.div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-bold text-white">Recent Notifications</h3>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {venueNotificationHistory.map(notification => (
                      <div key={notification.id} className="p-2 bg-green-500/10 border border-green-500/20 rounded text-xs">
                        <div className="text-white font-medium truncate">{notification.message}</div>
                        <div className="text-gray-400 mt-1">
                          {notification.zones.length} zone{notification.zones.length !== 1 ? 's' : ''} • {notification.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            </div>
          </div>
        )}

        {activeTab === 'venue-insights' && (
          <div className="space-y-6">
            <VenueSelector />
            <VenueAnalyticsPanel onNotificationSent={handleVenueNotificationSent} />
          </div>
        )}

        {activeTab === 'contacts' && (
          <ContactManager
            contacts={contacts}
            loading={contactsLoading}
            onAddContact={addContact}
            onUpdateContact={updateContact}
            onDeleteContact={deleteContact}
          />
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NotificationSettings
              settings={notificationSettings}
              zones={mockZones}
              onSettingsChange={setNotificationSettings}
            />
            
            <motion.div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-bold text-white">AWS SNS Status</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">WhatsApp Service</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-xs text-green-400">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">SMS Service</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-xs text-green-400">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Email Service</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-xs text-green-400">Active</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Crew Selection Modal */}
      {selectedRecommendation && (
        <CrewSelectionModal
          isOpen={showCrewModal}
          onClose={() => {
            setShowCrewModal(false);
            setSelectedRecommendation(null);
          }}
          recommendation={{
            id: selectedRecommendation.id,
            zoneId: selectedRecommendation.affectedZones[0] || '1',
            zoneName: selectedRecommendation.affectedZones[0] || 'Unknown Zone',
            type: 'high-density',
            severity: selectedRecommendation.severity === 'critical' ? 'critical' : 'high',
            message: selectedRecommendation.message,
            actionRequired: selectedRecommendation.suggestedAction,
            timestamp: selectedRecommendation.timestamp,
            status: 'pending'
          }}
          crewMembers={mockCrewMembers}
          organizer={mockOrganizer}
          onSendNotification={handleCrewNotification}
        />
      )}
    </div>
  );
};

export const NotificationsPage: React.FC = () => {
  return (
    <VenueProvider>
      <UnifiedNotificationsContent />
    </VenueProvider>
  );
};