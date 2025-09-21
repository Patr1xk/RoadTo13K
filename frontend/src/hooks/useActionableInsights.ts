import { useEffect, useRef, useState } from 'react';
import { QueueStationData, RecommendationInsight } from '../types';
import { useInsights } from '../contexts/InsightsContext';

export const useActionableInsights = (stations: QueueStationData[]) => {
  const { insights, addInsight, clearResolvedInsights } = useInsights();
  const [newInsightIds, setNewInsightIds] = useState<Set<string>>(new Set());
  const prevStationsRef = useRef<QueueStationData[]>([]);

  useEffect(() => {
    if (stations.length === 0) return;

    const prevStations = prevStationsRef.current;
    const newInsights: RecommendationInsight[] = [];

    stations.forEach(station => {
      const prevStation = prevStations.find(p => p.id === station.id);
      const utilizationRate = station.occupancy / station.capacity;
      
      // Only generate insights for significant changes or new critical conditions
      const isNewCongestion = station.status === 'congested' && prevStation?.status !== 'congested';
      const isHighQueue = station.queueLength > 20 && (prevStation?.queueLength || 0) <= 20;
      const isLongWait = station.waitTime > 8 && (prevStation?.waitTime || 0) <= 8;

      // Congestion alert
      if (isNewCongestion || (station.status === 'congested' && !prevStation)) {
        newInsights.push({
          id: `congestion-${station.id}-${Date.now()}`,
          type: 'bottleneck',
          severity: 'critical',
          title: `${station.name} Congested`,
          message: `Station at ${Math.round(utilizationRate * 100)}% capacity with ${station.queueLength} people in queue`,
          suggestedAction: station.type === 'checkpoint' ? 
            'Deploy additional staff or open parallel checkpoint' :
            'Enable fast-track processing or redirect flow',
          affectedZones: [station.name],
          timestamp: new Date(),
          actionable: true
        });
      }

      // High queue alert
      if (isHighQueue) {
        newInsights.push({
          id: `queue-${station.id}-${Date.now()}`,
          type: 'traffic',
          severity: 'warning',
          title: `Long Queue at ${station.name}`,
          message: `Queue length reached ${station.queueLength} people with ${station.waitTime}min wait time`,
          suggestedAction: station.type === 'pickup' ?
            'Enable express pickup lanes or increase processing speed' :
            'Consider opening additional processing lanes',
          affectedZones: [station.name],
          timestamp: new Date(),
          actionable: true
        });
      }

      // Extended wait time alert
      if (isLongWait) {
        newInsights.push({
          id: `wait-${station.id}-${Date.now()}`,
          type: 'occupancy',
          severity: 'warning',
          title: `Extended Wait Time`,
          message: `Average wait time at ${station.name} increased to ${station.waitTime} minutes`,
          suggestedAction: 'Optimize processing procedures or add staff support',
          affectedZones: [station.name],
          timestamp: new Date(),
          actionable: true
        });
      }
    });

    // Only add insights for meaningful events
    if (newInsights.length > 0) {
      newInsights.forEach(insight => addInsight(insight));

      // Track new insight IDs for highlighting
      const newIds = new Set(newInsights.map(i => i.id));
      setNewInsightIds(newIds);
      
      // Clear highlighting after 3 seconds
      setTimeout(() => {
        setNewInsightIds(new Set());
      }, 3000);
    }

    // Clear resolved insights based on current station status
    const activeZoneNames = stations
      .filter(s => s.status === 'congested' || s.queueLength > 15 || s.waitTime > 6)
      .map(s => s.name);
    
    clearResolvedInsights(activeZoneNames);

    prevStationsRef.current = stations;
  }, [stations]);

  return { insights, newInsightIds };
};