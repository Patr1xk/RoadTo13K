import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Filter, Download, RefreshCw, History } from 'lucide-react';
import { SimulationOccupancyTable } from '../components/analytics/SimulationOccupancyTable';
import { BusynessDistributionBar } from '../components/analytics/BusynessDistributionBar';
import { OccupancyChart } from '../components/analytics/OccupancyChart';
import { DistributionByZoneTypeChart } from '../components/analytics/DistributionByZoneTypeChart';
import { ViewModeToggle } from '../components/analytics/ViewModeToggle';
import { SessionFilters } from '../components/analytics/SessionFilters';
import { SessionGrid } from '../components/analytics/SessionGrid';
import { InteractiveSummaryStats } from '../components/analytics/InteractiveSummaryStats';

import { 
  ZoneStats, 
  BusynessInterval, 
  OccupancyTrendData, 
  ZoneTypeDistribution, 
  AnalyticsFilters,
  InteractionCallbacks,
  ChartViewMode,
  SimulationSession,
  Zone,
  NotificationPayload
} from '../types';

/**
 * Generate mock past simulation sessions with enhanced data
 */
const generateMockSessions = (): SimulationSession[] => [
  { 
    id: '1', 
    name: 'Stadium Event - Championship Game', 
    date: new Date('2024-01-20T19:00:00'), 
    duration: 180, 
    scenario: 'Sports Event', 
    totalVisitors: 3500, 
    avgDuration: 35, 
    peakTime: '20:45',
    location: 'MetLife Stadium',
    floorplan: 'Stadium Layout A',
    previewImage: '/images/stadium-preview.jpg',
    maxOccupancy: 2800,
    zones: [
      { id: '1', name: 'Main Entrance', x: 30, y: 280, width: 90, height: 40, type: 'entrance', color: '#22c55e' },
      { id: '2', name: 'Seating Area', x: 180, y: 120, width: 540, height: 80, type: 'seating', color: '#3b82f6' }
    ]
  },
  { 
    id: '2', 
    name: 'Concert - Rock Festival', 
    date: new Date('2024-01-19T20:00:00'), 
    duration: 240, 
    scenario: 'Concert', 
    totalVisitors: 4200, 
    avgDuration: 42, 
    peakTime: '21:30',
    location: 'Madison Square Garden',
    floorplan: 'Arena Layout B',
    previewImage: '/images/arena-preview.jpg',
    maxOccupancy: 3200,
    zones: [
      { id: '1', name: 'Stage Area', x: 200, y: 100, width: 400, height: 200, type: 'facility', color: '#f59e0b' },
      { id: '2', name: 'General Admission', x: 100, y: 350, width: 600, height: 150, type: 'seating', color: '#3b82f6' }
    ]
  },
  { 
    id: '3', 
    name: 'Mall - Black Friday Rush', 
    date: new Date('2024-01-18T08:00:00'), 
    duration: 600, 
    scenario: 'Shopping', 
    totalVisitors: 2800, 
    avgDuration: 65, 
    peakTime: '14:00',
    location: 'Westfield Mall',
    floorplan: 'Mall Layout C',
    previewImage: '/images/mall-preview.jpg',
    maxOccupancy: 1800,
    zones: [
      { id: '1', name: 'Food Court', x: 220, y: 60, width: 160, height: 120, type: 'facility', color: '#f59e0b' },
      { id: '2', name: 'Main Corridor', x: 60, y: 220, width: 560, height: 100, type: 'concourse', color: '#8b5cf6' }
    ]
  },
  { 
    id: '4', 
    name: 'Conference - Tech Summit', 
    date: new Date('2024-01-17T09:00:00'), 
    duration: 480, 
    scenario: 'Conference', 
    totalVisitors: 1200, 
    avgDuration: 180, 
    peakTime: '11:30',
    location: 'Convention Center',
    floorplan: 'Conference Layout D',
    previewImage: '/images/conference-preview.jpg',
    maxOccupancy: 800,
    zones: [
      { id: '1', name: 'Main Hall', x: 150, y: 100, width: 500, height: 300, type: 'seating', color: '#3b82f6' },
      { id: '2', name: 'Exhibition Area', x: 100, y: 450, width: 600, height: 100, type: 'facility', color: '#f59e0b' }
    ]
  },
  { 
    id: '5', 
    name: 'Stadium Event - Playoff Game', 
    date: new Date('2024-01-16T15:00:00'), 
    duration: 195, 
    scenario: 'Sports Event', 
    totalVisitors: 3800, 
    avgDuration: 38, 
    peakTime: '16:20',
    location: 'Yankee Stadium',
    floorplan: 'Stadium Layout B',
    previewImage: '/images/stadium2-preview.jpg',
    maxOccupancy: 3000,
    zones: [
      { id: '1', name: 'Home Entrance', x: 50, y: 300, width: 100, height: 50, type: 'entrance', color: '#22c55e' },
      { id: '2', name: 'Visitor Entrance', x: 650, y: 300, width: 100, height: 50, type: 'entrance', color: '#22c55e' }
    ]
  }
];

/**
 * Generate mock analytics data for demonstration
 */
const generateMockAnalyticsData = (sessionId?: string) => {
  // Generate session-specific data based on sessionId
  const sessionMultiplier = sessionId ? parseInt(sessionId) * 0.3 + 0.7 : 1;
  const sessionVariation = sessionId ? (parseInt(sessionId) % 3) * 0.2 : 0;
  
  const zoneStats: ZoneStats[] = [
    { 
      zoneId: '1', 
      zoneName: sessionId === '1' ? 'Main Entrance' : sessionId === '2' ? 'Stage Entrance' : sessionId === '3' ? 'Mall Entrance' : 'Conference Entry',
      occupancy: Math.floor((145 + sessionVariation * 50) * sessionMultiplier), 
      capacity: 200, 
      trafficFlow: Math.floor((25 + sessionVariation * 10) * sessionMultiplier), 
      dwellTime: 3.2 + sessionVariation, 
      busynessLevel: sessionMultiplier > 1.2 ? 'very-busy' : sessionMultiplier > 0.8 ? 'little-busy' : 'not-busy', 
      trend: ['up', 'down', 'stable'][parseInt(sessionId || '0') % 3] as 'up' | 'down' | 'stable'
    },
    { 
      zoneId: '2', 
      zoneName: sessionId === '1' ? 'Food Court' : sessionId === '2' ? 'VIP Area' : sessionId === '3' ? 'Food Court' : 'Exhibition Hall',
      occupancy: Math.floor((89 + sessionVariation * 30) * sessionMultiplier), 
      capacity: 120, 
      trafficFlow: Math.floor((12 + sessionVariation * 8) * sessionMultiplier), 
      dwellTime: 18.5 + sessionVariation * 5, 
      busynessLevel: sessionMultiplier > 1.1 ? 'very-busy' : 'little-busy', 
      trend: ['stable', 'up', 'down'][parseInt(sessionId || '0') % 3] as 'up' | 'down' | 'stable'
    },
    { 
      zoneId: '3', 
      zoneName: sessionId === '1' ? 'Seating Area A' : sessionId === '2' ? 'General Admission' : sessionId === '3' ? 'Main Corridor' : 'Main Hall',
      occupancy: Math.floor((180 + sessionVariation * 60) * sessionMultiplier), 
      capacity: 300, 
      trafficFlow: Math.floor((8 + sessionVariation * 5) * sessionMultiplier), 
      dwellTime: 45.2 + sessionVariation * 10, 
      busynessLevel: sessionMultiplier > 1.0 ? 'little-busy' : 'not-busy', 
      trend: ['down', 'stable', 'up'][parseInt(sessionId || '0') % 3] as 'up' | 'down' | 'stable'
    },
    { 
      zoneId: '4', 
      zoneName: sessionId === '1' ? 'Concourse North' : sessionId === '2' ? 'Backstage Area' : sessionId === '3' ? 'Shopping Area' : 'Networking Zone',
      occupancy: Math.floor((45 + sessionVariation * 20) * sessionMultiplier), 
      capacity: 150, 
      trafficFlow: Math.floor((35 + sessionVariation * 15) * sessionMultiplier), 
      dwellTime: 2.1 + sessionVariation * 2, 
      busynessLevel: 'not-busy', 
      trend: ['up', 'down', 'stable'][parseInt(sessionId || '0') % 3] as 'up' | 'down' | 'stable'
    },
    { 
      zoneId: '5', 
      zoneName: sessionId === '1' ? 'Emergency Exit' : sessionId === '2' ? 'Artist Exit' : sessionId === '3' ? 'Service Exit' : 'Main Exit',
      occupancy: Math.floor((5 + sessionVariation * 3) * sessionMultiplier), 
      capacity: 50, 
      trafficFlow: Math.floor((2 + sessionVariation) * sessionMultiplier), 
      dwellTime: 0.8 + sessionVariation * 0.5, 
      busynessLevel: 'not-busy', 
      trend: 'stable'
    }
  ];

  const busynessIntervals: BusynessInterval[] = [
    { 
      label: 'Not Busy', 
      value: 4.2 + sessionVariation, 
      percentage: 52.5 - sessionVariation * 10, 
      color: '#22c55e' 
    },
    { 
      label: 'A Little Busy', 
      value: 2.8 + sessionVariation * 0.5, 
      percentage: 35.0 + sessionVariation * 5, 
      color: '#f59e0b' 
    },
    { 
      label: 'Very Busy', 
      value: 1.0 + sessionVariation * 2, 
      percentage: 12.5 + sessionVariation * 5, 
      color: '#ef4444' 
    }
  ];

  const occupancyTrendData: OccupancyTrendData[] = [];
  const now = new Date();
  
  zoneStats.forEach(zone => {
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - (24 - i) * 60 * 60 * 1000);
      const actualOccupancy = Math.max(0, zone.occupancy + Math.random() * 40 - 20);
      const predictedOccupancy = Math.max(0, actualOccupancy + (Math.random() - 0.5) * 30);
      
      occupancyTrendData.push({
        timestamp,
        zoneId: zone.zoneId,
        zoneName: zone.zoneName,
        occupancy: actualOccupancy,
        capacity: zone.capacity,
        utilizationRate: (actualOccupancy / zone.capacity) * 100,
        predicted: predictedOccupancy,
        confidence: 0.7 + Math.random() * 0.3
      });
    }
  });

  const zoneTypeDistribution: ZoneTypeDistribution[] = [
    { type: 'entrance', label: 'Entrances', totalCapacity: 250, avgOccupancy: 150, peakOccupancy: 200, utilizationRate: 75, color: '#22c55e' },
    { type: 'seating', label: 'Seating Areas', totalCapacity: 600, avgOccupancy: 360, peakOccupancy: 480, utilizationRate: 60, color: '#3b82f6' },
    { type: 'concourse', label: 'Concourses', totalCapacity: 300, avgOccupancy: 90, peakOccupancy: 180, utilizationRate: 30, color: '#8b5cf6' },
    { type: 'facility', label: 'Facilities', totalCapacity: 200, avgOccupancy: 120, peakOccupancy: 160, utilizationRate: 60, color: '#f59e0b' },
    { type: 'exit', label: 'Exits', totalCapacity: 100, avgOccupancy: 15, peakOccupancy: 50, utilizationRate: 15, color: '#ef4444' }
  ];

  return { zoneStats, busynessIntervals, occupancyTrendData, zoneTypeDistribution };
};

interface SimulationAnalyticsProps {
  hideHeader?: boolean;
}

/**
 * Main Simulation Analytics page component with comprehensive data visualization
 * and interactive filtering capabilities
 */
export const SimulationAnalytics: React.FC<SimulationAnalyticsProps> = ({ hideHeader = false }) => {
  // View mode state
  const [viewMode, setViewMode] = useState<'live' | 'past'>('live');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [pastSessions] = useState<SimulationSession[]>(generateMockSessions());
  
  // Session filtering state
  const [sessionFilters, setSessionFilters] = useState({
    search: '',
    location: 'all',
    floorplan: 'all',
    scenario: 'all',
    dateRange: { start: '', end: '' }
  });
  
  // Data state management
  const [data, setData] = useState(generateMockAnalyticsData());
  const [highlightedZone, setHighlightedZone] = useState<string | null>(null);
  const [selectedZones, setSelectedZones] = useState<string[]>(['1', '2', '3']);
  const [selectedZoneType, setSelectedZoneType] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'donut' | 'stacked-bar'>('donut');
  const [occupancyChartType, setOccupancyChartType] = useState<'line' | 'bar'>('line');
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>({
    mode: 'actual',
    showDelta: false,
    highlightDifferences: false
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date()
    },
    timeRange: {
      start: '00:00',
      end: '23:59'
    },
    zoneTypes: ['entrance', 'seating', 'concourse', 'facility', 'exit'],
    selectedZones: ['1', '2', '3']
  });

  // Interaction callbacks
  const interactions: InteractionCallbacks = {
    onZoneHighlight: useCallback((zoneId: string | null) => {
      setHighlightedZone(zoneId);
    }, []),
    
    onZoneSelect: useCallback((zoneId: string) => {
      setSelectedZones(prev => 
        prev.includes(zoneId) 
          ? prev.filter(id => id !== zoneId)
          : [...prev, zoneId]
      );
    }, []),
    
    onTimeRangeChange: useCallback((start: Date, end: Date) => {
      setFilters(prev => ({
        ...prev,
        dateRange: { start, end }
      }));
    }, [])
  };

  // View mode handlers
  const handleViewModeChange = useCallback((newMode: 'live' | 'past') => {
    setViewMode(newMode);
    if (newMode === 'live') {
      setSelectedSession(null);
      setData(generateMockAnalyticsData());
    } else if (newMode === 'past') {
      setSelectedSession(null); // Always start with no session selected in past mode
    }
  }, [pastSessions]);

  const handleSessionSelect = useCallback((sessionId: string) => {
    setSelectedSession(sessionId);
    setIsLoading(true);
    
    // Simulate data loading with smooth transition
    setTimeout(() => {
      setData(generateMockAnalyticsData(sessionId));
      setIsLoading(false);
    }, 300);
  }, []);

  // Filter sessions based on current filters
  const filteredSessions = pastSessions.filter(session => {
    const matchesSearch = !sessionFilters.search || 
      session.name.toLowerCase().includes(sessionFilters.search.toLowerCase()) ||
      session.location.toLowerCase().includes(sessionFilters.search.toLowerCase());
    
    const matchesLocation = sessionFilters.location === 'all' || session.location === sessionFilters.location;
    const matchesFloorplan = sessionFilters.floorplan === 'all' || session.floorplan === sessionFilters.floorplan;
    const matchesScenario = sessionFilters.scenario === 'all' || session.scenario === sessionFilters.scenario;
    
    const matchesDateRange = (!sessionFilters.dateRange.start || session.date >= new Date(sessionFilters.dateRange.start)) &&
                            (!sessionFilters.dateRange.end || session.date <= new Date(sessionFilters.dateRange.end));
    
    return matchesSearch && matchesLocation && matchesFloorplan && matchesScenario && matchesDateRange;
  });



  // Data refresh handler
  const handleRefreshData = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const sessionId = viewMode === 'past' ? selectedSession || undefined : undefined;
    setData(generateMockAnalyticsData(sessionId));
    setIsLoading(false);
  }, [viewMode, selectedSession]);

  // Notification handler
  const handleNotifyCrew = useCallback(async (payload: NotificationPayload) => {
    console.log('Sending notification to crew:', payload);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Notification sent successfully to ${payload.recipients.join(', ')}\n\nMessage: ${payload.message}`);
    } catch (error) {
      console.error('Failed to send notification:', error);
      alert('Failed to send notification. Please try again.');
    }
  }, []);

  // Zone toggle handler for occupancy chart
  const handleZoneToggle = useCallback((zoneId: string) => {
    setSelectedZones(prev => 
      prev.includes(zoneId) 
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  }, []);

  // Export data handler
  const handleExportData = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      filters,
      zoneStats: data.zoneStats,
      occupancyTrends: data.occupancyTrendData,
      busynessDistribution: data.busynessIntervals,
      zoneTypeDistribution: data.zoneTypeDistribution
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data, filters]);

  return (
    <div className={`space-y-8 relative ${hideHeader ? 'pt-0' : ''}`}>
      {/* Conditional Page header */}
      {!hideHeader && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Simulation Analytics</h1>
              <p className="text-gray-400 text-lg">Comprehensive crowd behavior analysis and insights</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefreshData}
                disabled={isLoading}
                className="btn-modern bg-gray-700 hover:bg-gray-600"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={handleExportData}
                className="btn-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center justify-center">
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              isLoading={isLoading}
            />
          </div>
        </motion.div>
      )}
      
      {/* Integrated header controls for venue dashboard */}
      {hideHeader && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              isLoading={isLoading}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshData}
              disabled={isLoading}
              className="btn-modern bg-gray-700 hover:bg-gray-600"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={handleExportData}
              className="btn-primary"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </button>
          </div>
        </motion.div>
      )}

      {/* Enhanced sticky filters bar - Only show in live mode */}
      {viewMode === 'live' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="sticky top-4 z-40 glass-card p-4 backdrop-blur-xl border border-white/20 shadow-2xl"
          style={{
            background: 'rgba(17, 24, 39, 0.95)'
          }}
        >
          <motion.div 
            className="flex items-center justify-between"
            layout
          >
            <div className="flex items-center gap-4">
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Date Range:</span>
                <span className="text-sm text-white font-medium bg-white/10 px-2 py-1 rounded">
                  {filters.dateRange.start.toLocaleDateString()} - {filters.dateRange.end.toLocaleDateString()}
                </span>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Zones:</span>
                <span className="text-sm text-white font-medium bg-primary-500/20 px-2 py-1 rounded">
                  {selectedZones.length} selected
                </span>
              </motion.div>
              

            </div>
            
            <div className="flex items-center gap-3">
              {viewMode === 'live' && (
                <motion.div 
                  className="flex items-center gap-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-400 font-medium">LIVE</span>
                </motion.div>
              )}
              <div className="text-sm text-gray-400">
                {viewMode === 'live' ? 'Last updated:' : 'Session data:'} {new Date().toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Enhanced past simulation browser with sticky filters */}
      <AnimatePresence>
        {viewMode === 'past' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="space-y-6"
          >
            {/* Enhanced Session filters with sticky positioning */}
            <div className="relative">
              <SessionFilters
                sessions={pastSessions}
                filters={sessionFilters}
                onFiltersChange={setSessionFilters}
                isLoading={isLoading}
              />
            </div>
            
            {/* Session grid with enhanced animations */}
            <motion.div
              layout
              transition={{ duration: 0.3 }}
            >
              <SessionGrid
                sessions={filteredSessions}
                selectedSession={selectedSession}
                onSessionSelect={handleSessionSelect}
                isLoading={isLoading}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Summary Statistics - Only show in live mode */}
      <AnimatePresence mode="wait">
        {viewMode === 'live' && (
          <motion.div
            key={`summary-${viewMode}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <InteractiveSummaryStats />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics layout - Charts and Tables - Only show in live mode */}
      <AnimatePresence mode="wait">
        {viewMode === 'live' && (
          <motion.div
            key={`${viewMode}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-6"
          >

            {/* Occupancy table - full width */}
            <SimulationOccupancyTable
              zoneStats={data.zoneStats}
              highlightedZone={highlightedZone}
              interactions={interactions}
              isLoading={isLoading}
            />

            {/* Occupancy trends chart - full width */}
            <OccupancyChart
              data={data.occupancyTrendData}
              selectedZones={selectedZones}
              timeRange={filters.dateRange}
              chartType={occupancyChartType}
              onZoneToggle={handleZoneToggle}
              onTimeRangeChange={interactions.onTimeRangeChange}
              viewMode={chartViewMode}
              onViewModeChange={setChartViewMode}
            />

            {/* Distribution charts - compact side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BusynessDistributionBar
                intervals={data.busynessIntervals}
                totalHours={data.busynessIntervals.reduce((sum, interval) => sum + interval.value, 0)}
                isAnimated={true}
                onSegmentHover={(interval) => {
                  // Handle segment hover for cross-highlighting
                }}
                onSegmentClick={(interval) => {
                  // Handle segment selection
                }}
              />

              <DistributionByZoneTypeChart
                data={data.zoneTypeDistribution}
                chartType={chartType}
                onChartTypeChange={setChartType}
                onZoneTypeSelect={setSelectedZoneType}
                selectedZoneType={selectedZoneType}
              />
            </div>
          </motion.div>
        )}

      </AnimatePresence>


    </div>
  );
};