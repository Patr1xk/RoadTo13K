import { useState, useEffect } from 'react';
import { useVenue } from '../contexts/VenueContext';

interface AggregatedInsight {
  id: string;
  venueName: string;
  venueId: string;
  overallOccupancy: string;
  keyAction: string;
  affectedZones: string[];
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
}

export const useAggregatedInsights = () => {
  const { venues, selectedVenue } = useVenue();
  const [insights, setInsights] = useState<AggregatedInsight[]>([]);

  useEffect(() => {
    const generateAggregatedInsights = () => {
      const currentVenue = venues.find(v => v.id === selectedVenue);
      if (!currentVenue) return [];

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

      const venueData = mockData[selectedVenue as keyof typeof mockData];
      if (!venueData) return [];

      return [{
        id: `${selectedVenue}-aggregate-${Date.now()}`,
        venueName: currentVenue.name,
        venueId: selectedVenue,
        overallOccupancy: venueData.occupancy,
        keyAction: venueData.keyAction,
        affectedZones: venueData.affectedZones,
        severity: venueData.severity,
        timestamp: new Date()
      }];
    };

    setInsights(generateAggregatedInsights());
  }, [selectedVenue, venues]);

  return { insights };
};