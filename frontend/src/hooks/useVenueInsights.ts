import { useState, useEffect } from 'react';
import { RecommendationInsight } from '../types';

const generateVenueInsights = (venueId: string, zoneId: string): RecommendationInsight[] => {
  const insightTemplates = {
    airport: {
      'pre-screening': [
        {
          type: 'bottleneck',
          severity: 'warning',
          title: 'Pre-Screening Queue Building',
          message: 'Queue length exceeding 15 people with 8-minute wait time',
          suggestedAction: 'Deploy additional screening staff or open express lane',
          affectedZones: ['Pre-Screening']
        }
      ],
      'baggage': [
        {
          type: 'traffic',
          severity: 'critical',
          title: 'Baggage Check Congestion',
          message: 'Processing rate 40% below normal capacity',
          suggestedAction: 'Open additional baggage screening lanes immediately',
          affectedZones: ['Baggage Check']
        }
      ],
      'main-entrance': [
        {
          type: 'occupancy',
          severity: 'info',
          title: 'Entrance Flow Normal',
          message: 'Steady flow with minimal wait times',
          suggestedAction: 'Continue monitoring for peak hour preparation',
          affectedZones: ['Main Entrance']
        }
      ]
    },
    mall: {
      'entrance': [
        {
          type: 'traffic',
          severity: 'warning',
          title: 'Weekend Rush Detected',
          message: 'Higher than normal foot traffic at main entrance',
          suggestedAction: 'Position additional staff for crowd guidance',
          affectedZones: ['Main Entrance']
        }
      ],
      'food-court': [
        {
          type: 'occupancy',
          severity: 'critical',
          title: 'Food Court at Capacity',
          message: 'All seating areas occupied with queue forming',
          suggestedAction: 'Implement queue management and consider overflow areas',
          affectedZones: ['Food Court']
        }
      ],
      'parking': [
        {
          type: 'bottleneck',
          severity: 'warning',
          title: 'Parking Level 2 Full',
          message: 'Level 2 at 95% capacity, directing to Level 3',
          suggestedAction: 'Update digital signage and deploy parking attendants',
          affectedZones: ['Parking Area']
        }
      ]
    },
    stadium: {
      'gate-a': [
        {
          type: 'bottleneck',
          severity: 'critical',
          title: 'Gate A Entry Bottleneck',
          message: 'Ticket scanning delays causing backup',
          suggestedAction: 'Open additional scanning lanes and deploy staff',
          affectedZones: ['Gate A']
        }
      ],
      'concourse': [
        {
          type: 'occupancy',
          severity: 'warning',
          title: 'Concourse Crowding',
          message: 'High density near concession stands',
          suggestedAction: 'Guide crowd flow and monitor for safety',
          affectedZones: ['Concourse']
        }
      ],
      'seating': [
        {
          type: 'traffic',
          severity: 'info',
          title: 'Seating Movement Normal',
          message: 'Orderly movement to assigned sections',
          suggestedAction: 'Continue monitoring during event start',
          affectedZones: ['Seating Area']
        }
      ]
    }
  };

  const venueTemplates = insightTemplates[venueId as keyof typeof insightTemplates];
  if (!venueTemplates) return [];

  const zoneTemplates = (venueTemplates as any)[zoneId];
  if (!zoneTemplates || !Array.isArray(zoneTemplates)) return [];

  return zoneTemplates.map((template: any, index: number) => ({
    id: `${venueId}-${zoneId}-${Date.now()}-${index}`,
    type: template.type as any,
    severity: template.severity as any,
    title: template.title,
    message: template.message,
    suggestedAction: template.suggestedAction,
    affectedZones: template.affectedZones,
    timestamp: new Date(),
    actionable: true
  }));
};

export const useVenueInsights = (venueId: string, zoneId: string) => {
  const [insights, setInsights] = useState<RecommendationInsight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      const newInsights = generateVenueInsights(venueId, zoneId);
      setInsights(newInsights);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [venueId, zoneId]);

  return { insights, loading };
};