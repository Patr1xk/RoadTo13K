import { useMemo } from 'react';
import { ZoneStats, NotificationSettings, RecommendationInsight } from '../types';

export const useRecommendationEngine = (
  zoneStats: ZoneStats[],
  notificationSettings: NotificationSettings
): RecommendationInsight[] => {
  return useMemo(() => {
    if (!notificationSettings.enabled || zoneStats.length === 0) {
      return [];
    }

    const insights: RecommendationInsight[] = [];

    zoneStats.forEach(zone => {
      const utilizationRate = (zone.occupancy / zone.capacity) * 100;
      const zoneSettings = notificationSettings.zoneSpecific[zone.zoneId];
      
      if (zoneSettings && !zoneSettings.enabled) {
        return;
      }

      if (utilizationRate >= notificationSettings.thresholds.occupancyRate) {
        insights.push({
          id: `occupancy-${zone.zoneId}-${Date.now()}`,
          type: 'occupancy',
          severity: utilizationRate >= 95 ? 'critical' : utilizationRate >= 85 ? 'warning' : 'info',
          title: `High Occupancy in ${zone.zoneName}`,
          message: `Current occupancy is ${Math.round(utilizationRate)}% (${zone.occupancy}/${zone.capacity}). Consider crowd control measures.`,
          suggestedAction: `Deploy additional staff to ${zone.zoneName} to manage crowd flow and prevent overcrowding.`,
          affectedZones: [zone.zoneName],
          timestamp: new Date(),
          actionable: true
        });
      }

      if (zone.trafficFlow >= notificationSettings.thresholds.trafficFlow) {
        insights.push({
          id: `traffic-${zone.zoneId}-${Date.now()}`,
          type: 'traffic',
          severity: zone.trafficFlow >= 50 ? 'critical' : 'warning',
          title: `High Traffic Flow in ${zone.zoneName}`,
          message: `Traffic flow is ${Math.round(zone.trafficFlow)} people/min. Monitor for potential bottlenecks.`,
          suggestedAction: `Increase staff presence in ${zone.zoneName} and prepare crowd redirection if needed.`,
          affectedZones: [zone.zoneName],
          timestamp: new Date(),
          actionable: true
        });
      }

      if (zone.dwellTime >= notificationSettings.thresholds.dwellTime) {
        insights.push({
          id: `dwell-${zone.zoneId}-${Date.now()}`,
          type: 'bottleneck',
          severity: zone.dwellTime >= 15 ? 'warning' : 'info',
          title: `Extended Dwell Time in ${zone.zoneName}`,
          message: `Average dwell time is ${zone.dwellTime.toFixed(1)} minutes. Potential bottleneck detected.`,
          suggestedAction: `Investigate cause of delays in ${zone.zoneName} and implement flow optimization measures.`,
          affectedZones: [zone.zoneName],
          timestamp: new Date(),
          actionable: true
        });
      }
    });

    const highTrafficZones = zoneStats.filter(z => 
      (z.occupancy / z.capacity) * 100 >= notificationSettings.thresholds.occupancyRate
    );

    if (highTrafficZones.length >= 3) {
      insights.push({
        id: `multi-zone-${Date.now()}`,
        type: 'traffic',
        severity: 'critical',
        title: 'Multiple High-Traffic Zones Detected',
        message: `${highTrafficZones.length} zones are experiencing high traffic simultaneously.`,
        suggestedAction: 'Activate emergency crowd management protocol and coordinate staff deployment across affected areas.',
        affectedZones: highTrafficZones.map(z => z.zoneName),
        timestamp: new Date(),
        actionable: true
      });
    }

    return insights;
  }, [zoneStats, notificationSettings]);
};