import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Users, Eye, Plane, Building, MapPin } from 'lucide-react';
import { useVenue } from '../../contexts/VenueContext';

interface AggregatedInsightsPanelProps {
  onViewDetails: (venueId: string) => void;
}

export const AggregatedInsightsPanel: React.FC<AggregatedInsightsPanelProps> = ({
  onViewDetails
}) => {
  const { venues } = useVenue();
  
  const generateAllVenueInsights = () => {
    const mockData = {
      airport: {
        occupancy: '142% (213/150)',
        keyAction: 'Deploy additional security staff to reduce queue times',
        affectedZones: ['Pre-Screening', 'Baggage Check', 'Security Gate'],
        severity: 'critical' as const
      },
      mall: {
        occupancy: '116% (163/140)',
        keyAction: 'Implement crowd control measures in high-traffic areas',
        affectedZones: ['Food Court', 'Main Entrance', 'Escalators'],
        severity: 'warning' as const
      },
      stadium: {
        occupancy: '89% (267/300)',
        keyAction: 'Monitor entry flow and prepare for peak arrival times',
        affectedZones: ['Gate A', 'Concourse'],
        severity: 'info' as const
      }
    };

    return venues.map(venue => {
      const venueData = mockData[venue.id as keyof typeof mockData];
      return {
        id: `${venue.id}-aggregate-${Date.now()}`,
        venueName: venue.name,
        venueId: venue.id,
        overallOccupancy: venueData?.occupancy || '85% (Normal)',
        keyAction: venueData?.keyAction || 'Continue monitoring operations',
        affectedZones: venueData?.affectedZones || venue.zones.slice(0, 2).map(z => z.name),
        severity: venueData?.severity || 'info',
        timestamp: new Date()
      };
    });
  };
  
  const insights = generateAllVenueInsights();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500/50 bg-red-500/10 text-red-300';
      case 'warning': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300';
      case 'info': return 'border-blue-500/50 bg-blue-500/10 text-blue-300';
      default: return 'border-gray-500/50 bg-gray-500/10 text-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-6 h-6 text-red-400" />;
      case 'warning': return <TrendingUp className="w-6 h-6 text-yellow-400" />;
      case 'info': return <Users className="w-6 h-6 text-blue-400" />;
      default: return <AlertTriangle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getVenueIcon = (venueId: string) => {
    const venue = venues.find(v => v.id === venueId);
    switch (venue?.type) {
      case 'airport': return <Plane className="w-5 h-5 text-gray-400" />;
      case 'mall': return <Building className="w-5 h-5 text-gray-400" />;
      case 'stadium': return <MapPin className="w-5 h-5 text-gray-400" />;
      default: return <MapPin className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Live Venue Insights</h3>
        <div className="text-sm text-gray-400">{insights.length} active venue{insights.length !== 1 ? 's' : ''}</div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border rounded-xl p-6 ${getSeverityColor(insight.severity)}`}
          >
            <div className="flex items-start gap-4">
              {getSeverityIcon(insight.severity)}
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getVenueIcon(insight.venueId)}
                    <h4 className="text-lg font-bold text-white">{insight.venueName}</h4>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 capitalize font-medium">
                    {insight.severity}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-1">Overall Occupancy</div>
                  <div className="text-2xl font-bold text-white">{insight.overallOccupancy}</div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Key Action Required</div>
                  <p className="text-white font-medium">{insight.keyAction}</p>
                </div>
                
                <div className="mb-6">
                  <div className="text-sm text-gray-400 mb-2">Affected Zones</div>
                  <div className="flex flex-wrap gap-2">
                    {insight.affectedZones.map(zone => (
                      <span 
                        key={zone}
                        className="px-3 py-1 bg-white/10 text-gray-300 rounded-lg text-sm"
                      >
                        {zone}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Updated: {insight.timestamp.toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => onViewDetails(insight.venueId)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View More Details
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {insights.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">✅</div>
            <div className="text-lg font-medium">All venues operating normally</div>
            <div className="text-sm mt-1">No critical insights detected</div>
          </div>
        )}
      </div>
    </div>
  );
};