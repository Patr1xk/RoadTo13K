import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QueueFlowDiagram } from '../components/QueueFlowDiagram';
import { SummaryCards } from '../components/SummaryCards';
import { QueueStatsTable } from '../components/QueueStatsTable';
import { TimeDistributionChart } from '../components/TimeDistributionChart';
import { TimeSlider } from '../components/TimeSlider';
import { SimulationTabs } from '../components/SimulationTabs';
import { PastSimulationsList } from '../components/PastSimulationsList';
import { NotificationStatus } from '../components/NotificationStatus';
import { RecommendationInsightsPanel } from '../components/RecommendationInsightsPanel';
import { useActionableInsights } from '../hooks/useActionableInsights';
import { InsightsProvider } from '../contexts/InsightsContext';
import { CrowdData, Zone, ZoneStats, SummaryMetrics, TimeDistribution, SimulationSession, NotificationPayload, QueueStationData } from '../types';

const mockZones: Zone[] = [
  { id: '1', name: 'Main Entrance', x: 50, y: 280, width: 120, height: 60, type: 'entrance', color: '#22c55e' },
  { id: '2', name: 'North Entrance', x: 390, y: 50, width: 120, height: 60, type: 'entrance', color: '#22c55e' },
  { id: '3', name: 'Upper Seating', x: 200, y: 140, width: 500, height: 100, type: 'seating', color: '#3b82f6' },
  { id: '4', name: 'Lower Seating', x: 200, y: 360, width: 500, height: 100, type: 'seating', color: '#3b82f6' },
  { id: '5', name: 'North Concourse', x: 100, y: 250, width: 200, height: 80, type: 'concourse', color: '#8b5cf6' },
  { id: '6', name: 'South Concourse', x: 600, y: 250, width: 200, height: 80, type: 'concourse', color: '#8b5cf6' },
  { id: '7', name: 'West Facilities', x: 50, y: 180, width: 100, height: 80, type: 'facility', color: '#f59e0b' },
  { id: '8', name: 'East Facilities', x: 750, y: 180, width: 100, height: 80, type: 'facility', color: '#f59e0b' },
  { id: '9', name: 'East Exit', x: 750, y: 350, width: 100, height: 60, type: 'exit', color: '#ef4444' },
  { id: '10', name: 'South Exit', x: 400, y: 500, width: 100, height: 60, type: 'exit', color: '#ef4444' }
];

const generateMockData = (): {
  crowdData: CrowdData[];
  zoneStats: ZoneStats[];
  summaryMetrics: SummaryMetrics;
  timeDistribution: TimeDistribution;
} => {
  const crowdData: CrowdData[] = [];
  for (let x = 0; x < 30; x++) {
    for (let y = 0; y < 20; y++) {
      crowdData.push({
        x, y,
        density: Math.random() * 10,
        area: `Zone ${Math.floor(x/5)}-${Math.floor(y/4)}`
      });
    }
  }

  const zoneStats: ZoneStats[] = mockZones.map(zone => {
    const occupancy = Math.floor(Math.random() * 150) + 10;
    const capacity = Math.floor(Math.random() * 100) + 100;
    return {
      zoneId: zone.id,
      zoneName: zone.name,
      occupancy,
      capacity,
      trafficFlow: Math.floor(Math.random() * 20) + 2,
      dwellTime: Math.floor(Math.random() * 30) + 5,
      busynessLevel: ['not-busy', 'little-busy', 'very-busy'][Math.floor(Math.random() * 3)] as 'not-busy' | 'little-busy' | 'very-busy',
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
      utilizationRate: (occupancy / capacity) * 100
    };
  });

  const summaryMetrics: SummaryMetrics = {
    engagedCustomers: 1247,
    averageDuration: 28,
    trafficTrend: 12.5,
    totalVisitors: 2890
  };

  const timeDistribution: TimeDistribution = {
    notBusy: 4.2,
    littleBusy: 2.8,
    veryBusy: 1.5
  };

  return { crowdData, zoneStats, summaryMetrics, timeDistribution };
};

const mockSessions: SimulationSession[] = [
  { id: '1', name: 'Stadium Event - Game Day', date: new Date('2024-01-15T19:00:00'), duration: 180, scenario: 'Sports Event', totalVisitors: 3200, avgDuration: 32, peakTime: '20:30', location: 'Stadium A', floorplan: 'Stadium Layout', previewImage: '/api/preview/1.jpg', maxOccupancy: 3500, zones: mockZones },
  { id: '2', name: 'Concert - Evening Show', date: new Date('2024-01-14T20:00:00'), duration: 150, scenario: 'Concert', totalVisitors: 2800, avgDuration: 28, peakTime: '21:15', location: 'Arena B', floorplan: 'Concert Hall', previewImage: '/api/preview/2.jpg', maxOccupancy: 3000, zones: mockZones },
  { id: '3', name: 'Mall - Weekend Rush', date: new Date('2024-01-13T14:00:00'), duration: 240, scenario: 'Shopping', totalVisitors: 1950, avgDuration: 45, peakTime: '16:00', location: 'Shopping Center', floorplan: 'Mall Layout', previewImage: '/api/preview/3.jpg', maxOccupancy: 2500, zones: mockZones }
];

const LiveSimulationContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'past'>('live');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<{
    isVisible: boolean;
    status: 'sending' | 'success' | 'error';
    message: string;
  }>({ isVisible: false, status: 'success', message: '' });
  
  const [data, setData] = useState(generateMockData());
  const [queueStations, setQueueStations] = useState<QueueStationData[]>([]);
  const [isInsightsPaused, setIsInsightsPaused] = useState(false);
  const { insights, newInsightIds } = useActionableInsights(queueStations);
  
  const handleStatsUpdate = (newStats: ZoneStats[]) => {
    setData(prev => ({ ...prev, zoneStats: newStats }));
  };

  const handleQueueStatsUpdate = (stations: QueueStationData[]) => {
    setQueueStations(stations);
  };

  const handleInsightsPauseChange = (isPaused: boolean) => {
    setIsInsightsPaused(isPaused);
  };

  const handleNotifyCrew = async (payload: NotificationPayload) => {
    console.log('Sending notification to crew:', payload);
    
    // Show sending status
    setNotificationStatus({
      isVisible: true,
      status: 'sending',
      message: `Sending alert to ${payload.recipients.length} crew member(s)...`
    });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success status with crew count
      const crewCount = payload.recipients.length;
      setNotificationStatus({
        isVisible: true,
        status: 'success',
        message: `Alert sent successfully to ${crewCount} crew member${crewCount !== 1 ? 's' : ''} for ${payload.zoneId ? `Zone: ${data.zoneStats.find(z => z.zoneId === payload.zoneId)?.zoneName || payload.zoneId}` : 'multiple zones'}. Crew will respond via WhatsApp.`
      });
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setNotificationStatus(prev => ({ ...prev, isVisible: false }));
      }, 5000);
      
    } catch (error) {
      console.error('Failed to send notification:', error);
      
      // Show error status
      setNotificationStatus({
        isVisible: true,
        status: 'error',
        message: 'Failed to send notification. Please check connection and try again.'
      });
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setNotificationStatus(prev => ({ ...prev, isVisible: false }));
      }, 5000);
    }
  };

  // Live data updates
  useEffect(() => {
    if (activeTab === 'live' && !isInsightsPaused) {
      const interval = setInterval(() => {
        setData(generateMockData());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTab, isInsightsPaused]);

  // Update data when session changes
  useEffect(() => {
    if (activeTab === 'past' && selectedSession) {
      setData(generateMockData());
    }
  }, [activeTab, selectedSession]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Crowd Traffic Dashboard</h1>
        <p className="text-gray-400 text-lg">Real-time monitoring and historical analysis</p>
      </motion.div>

      <SimulationTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'live' && (
        <motion.div
          key="live"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <SummaryCards metrics={data.summaryMetrics} isLive={true} />
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <QueueFlowDiagram 
                isLive={true}
                onStatsUpdate={handleQueueStatsUpdate}
              />
            </div>
            
            <div className="space-y-6">
              <TimeDistributionChart distribution={data.timeDistribution} />
              <RecommendationInsightsPanel 
                insights={insights}
                newInsightIds={newInsightIds}
                onPauseChange={handleInsightsPauseChange}
              />
            </div>
          </div>
          
          {queueStations.length > 0 && <QueueStatsTable stations={queueStations} />}
        </motion.div>
      )}

      {activeTab === 'past' && (
        <motion.div
          key="past"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <PastSimulationsList
                sessions={mockSessions}
                selectedSession={selectedSession}
                onSessionSelect={setSelectedSession}
              />
            </div>
            
            <div className="lg:col-span-3 space-y-6">
              {selectedSession && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-4 mb-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {mockSessions.find(s => s.id === selectedSession)?.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {mockSessions.find(s => s.id === selectedSession)?.scenario} • 
                          {mockSessions.find(s => s.id === selectedSession)?.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Duration</div>
                        <div className="text-lg font-bold text-white">
                          {mockSessions.find(s => s.id === selectedSession)?.duration}min
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <SummaryCards metrics={data.summaryMetrics} isLive={false} />
                  
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2">
                      <QueueFlowDiagram 
                        isLive={false}
                        onStatsUpdate={handleQueueStatsUpdate}
                      />
                    </div>
                    
                    <div className="space-y-6">
                      <TimeDistributionChart distribution={data.timeDistribution} />
                    </div>
                  </div>
                  
                  {queueStations.length > 0 && <QueueStatsTable stations={queueStations} />}
                </>
              )}
              
              {!selectedSession && (
                <div className="glass-card p-12 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-bold text-white mb-2">Select a Simulation</h3>
                  <p className="text-gray-400">Choose a past simulation session to analyze historical data</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      {/* Notification Status */}
      <NotificationStatus
        isVisible={notificationStatus.isVisible}
        status={notificationStatus.status}
        message={notificationStatus.message}
        onClose={() => setNotificationStatus(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export const LiveSimulation: React.FC = () => {
  return (
    <InsightsProvider>
      <LiveSimulationContent />
    </InsightsProvider>
  );
};