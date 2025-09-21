import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, Clock, MapPin } from 'lucide-react';
import { SimulationOccupancyTable } from '../components/analytics/SimulationOccupancyTable';
import { BusynessDistributionBar } from '../components/analytics/BusynessDistributionBar';
import { OccupancyChart } from '../components/analytics/OccupancyChart';
import { DistributionByZoneTypeChart } from '../components/analytics/DistributionByZoneTypeChart';
import { 
  ZoneStats, 
  BusynessInterval, 
  OccupancyTrendData, 
  ZoneTypeDistribution, 
  AnalyticsFilters,
  InteractionCallbacks,
  ChartViewMode,
  SimulationSession
} from '../types';

const generateMockAnalyticsData = (sessionId: string) => {
  const sessionMultiplier = parseInt(sessionId) * 0.3 + 0.7;
  const sessionVariation = (parseInt(sessionId) % 3) * 0.2;
  
  const zoneStats: ZoneStats[] = [
    { 
      zoneId: '1', 
      zoneName: sessionId === '1' ? 'Main Entrance' : sessionId === '2' ? 'Stage Entrance' : 'Mall Entrance',
      occupancy: Math.floor((145 + sessionVariation * 50) * sessionMultiplier), 
      capacity: 200, 
      trafficFlow: Math.floor((25 + sessionVariation * 10) * sessionMultiplier), 
      dwellTime: 3.2 + sessionVariation, 
      busynessLevel: sessionMultiplier > 1.2 ? 'very-busy' : sessionMultiplier > 0.8 ? 'little-busy' : 'not-busy', 
      trend: ['up', 'down', 'stable'][parseInt(sessionId) % 3] as 'up' | 'down' | 'stable'
    },
    { 
      zoneId: '2', 
      zoneName: sessionId === '1' ? 'Food Court' : sessionId === '2' ? 'VIP Area' : 'Food Court',
      occupancy: Math.floor((89 + sessionVariation * 30) * sessionMultiplier), 
      capacity: 120, 
      trafficFlow: Math.floor((12 + sessionVariation * 8) * sessionMultiplier), 
      dwellTime: 18.5 + sessionVariation * 5, 
      busynessLevel: sessionMultiplier > 1.1 ? 'very-busy' : 'little-busy', 
      trend: ['stable', 'up', 'down'][parseInt(sessionId) % 3] as 'up' | 'down' | 'stable'
    }
  ];

  const busynessIntervals: BusynessInterval[] = [
    { label: 'Not Busy', value: 4.2 + sessionVariation, percentage: 52.5 - sessionVariation * 10, color: '#22c55e' },
    { label: 'A Little Busy', value: 2.8 + sessionVariation * 0.5, percentage: 35.0 + sessionVariation * 5, color: '#f59e0b' },
    { label: 'Very Busy', value: 1.0 + sessionVariation * 2, percentage: 12.5 + sessionVariation * 5, color: '#ef4444' }
  ];

  const occupancyTrendData: OccupancyTrendData[] = [];
  const now = new Date();
  
  zoneStats.forEach(zone => {
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - (24 - i) * 60 * 60 * 1000);
      const actualOccupancy = Math.max(0, zone.occupancy + Math.random() * 40 - 20);
      
      occupancyTrendData.push({
        timestamp,
        zoneId: zone.zoneId,
        zoneName: zone.zoneName,
        occupancy: actualOccupancy,
        capacity: zone.capacity,
        utilizationRate: (actualOccupancy / zone.capacity) * 100,
        predicted: actualOccupancy + (Math.random() - 0.5) * 30,
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

const mockSessions: SimulationSession[] = [
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
    zones: []
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
    zones: []
  }
];

export const SessionDetail: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState(generateMockAnalyticsData(sessionId || '1'));
  const [highlightedZone, setHighlightedZone] = useState<string | null>(null);
  const [selectedZones, setSelectedZones] = useState<string[]>(['1', '2']);
  const [selectedZoneType, setSelectedZoneType] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'donut' | 'stacked-bar'>('donut');
  const [occupancyChartType, setOccupancyChartType] = useState<'line' | 'bar'>('line');
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>({
    mode: 'actual',
    showDelta: false,
    highlightDifferences: false
  });

  const [filters] = useState<AnalyticsFilters>({
    dateRange: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date()
    },
    timeRange: { start: '00:00', end: '23:59' },
    zoneTypes: ['entrance', 'seating', 'concourse', 'facility', 'exit'],
    selectedZones: ['1', '2']
  });

  const session = mockSessions.find(s => s.id === sessionId);

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
    
    onTimeRangeChange: useCallback(() => {}, [])
  };

  const handleZoneToggle = useCallback((zoneId: string) => {
    setSelectedZones(prev => 
      prev.includes(zoneId) 
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  }, []);

  const handleBackToSessions = () => {
    navigate('/analytics', { state: { viewMode: 'past' } });
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Session Not Found</h2>
          <button onClick={handleBackToSessions} className="btn-primary">
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <motion.button
              onClick={handleBackToSessions}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </motion.button>
            
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {session.name}
              </h1>
              <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {session.date.toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {session.duration} minutes
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {session.totalVisitors.toLocaleString()} visitors
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {session.location}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
              {session.scenario}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Analytics Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <SimulationOccupancyTable
          zoneStats={data.zoneStats}
          highlightedZone={highlightedZone}
          interactions={interactions}
          isLoading={false}
        />

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BusynessDistributionBar
            intervals={data.busynessIntervals}
            totalHours={data.busynessIntervals.reduce((sum, interval) => sum + interval.value, 0)}
            isAnimated={true}
            onSegmentHover={() => {}}
            onSegmentClick={() => {}}
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
    </div>
  );
};