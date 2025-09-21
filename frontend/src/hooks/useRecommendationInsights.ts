import { useState, useEffect } from 'react';
import { ZoneStats, RecommendationInsight } from '../types';

export const useRecommendationInsights = (zoneStats: ZoneStats[]) => {
  const [insights, setInsights] = useState<RecommendationInsight[]>([]);

  useEffect(() => {
    const generateInsights = () => {
      const newInsights: RecommendationInsight[] = [];

      zoneStats.forEach(zone => {
        const occupancyRate = zone.occupancy / zone.capacity;
        
        // High occupancy insight
        if (occupancyRate > 0.85) {
          newInsights.push({
            id: `occupancy-${zone.zoneId}`,
            type: 'occupancy',
            severity: occupancyRate > 0.95 ? 'critical' : 'warning',
            title: 'High Occupancy Alert',
            message: `${zone.zoneName} is at ${Math.round(occupancyRate * 100)}% capacity`,
            suggestedAction: 'Deploy crowd control staff and consider redirecting traffic',
            affectedZones: [zone.zoneName],
            timestamp: new Date(),
            actionable: true
          });
        }

        // Extended dwell time insight
        if (zone.dwellTime > 15) {
          newInsights.push({
            id: `dwell-${zone.zoneId}`,
            type: 'traffic',
            severity: zone.dwellTime > 25 ? 'critical' : 'warning',
            title: 'Extended Dwell Time',
            message: `Average dwell time in ${zone.zoneName} is ${zone.dwellTime} minutes`,
            suggestedAction: 'Increase throughput capacity or add guidance signage',
            affectedZones: [zone.zoneName],
            timestamp: new Date(),
            actionable: true
          });
        }

        // Bottleneck detection
        if (zone.trafficFlow > 50 && occupancyRate > 0.7) {
          newInsights.push({
            id: `bottleneck-${zone.zoneId}`,
            type: 'bottleneck',
            severity: 'warning',
            title: 'Potential Bottleneck',
            message: `High traffic flow (${Math.round(zone.trafficFlow)}/min) with elevated occupancy`,
            suggestedAction: 'Monitor closely and prepare alternative routing',
            affectedZones: [zone.zoneName],
            timestamp: new Date(),
            actionable: true
          });
        }
      });

      // Limit to top 4 most critical insights
      const sortedInsights = newInsights
        .sort((a, b) => {
          const severityOrder = { critical: 3, warning: 2, info: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        })
        .slice(0, 4);

      setInsights(sortedInsights);
    };

    if (zoneStats.length > 0) {
      generateInsights();
    }
  }, [zoneStats]);

  return insights;
};