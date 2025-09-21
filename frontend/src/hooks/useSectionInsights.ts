import { useState, useEffect } from 'react';
import { SectionInsight } from '../types';

const generateMockInsights = (): SectionInsight[] => {
  const sections = [
    { id: 'main-entrance', name: 'Main Entrance' },
    { id: 'west-facilities', name: 'West Facilities' },
    { id: 'exit-gate', name: 'Exit Gate' },
    { id: 'seating-area', name: 'Seating Area' }
  ];

  const insights: SectionInsight[] = [];

  sections.forEach(section => {
    // Generate 0-3 random insights per section
    const insightCount = Math.floor(Math.random() * 4);
    
    for (let i = 0; i < insightCount; i++) {
      const types = ['congestion', 'capacity', 'flow', 'timing'];
      const severities = ['info', 'warning', 'critical'];
      
      const type = types[Math.floor(Math.random() * types.length)] as any;
      const severity = severities[Math.floor(Math.random() * severities.length)] as any;
      
      const insightTemplates = {
        'main-entrance': {
          congestion: {
            title: 'Queue Congestion Detected',
            description: 'Entry queue length exceeding normal capacity',
            recommendation: 'Deploy additional screening staff or open secondary entrance'
          },
          capacity: {
            title: 'Processing Capacity Alert',
            description: 'Current processing rate below optimal threshold',
            recommendation: 'Optimize screening procedures or add processing lanes'
          },
          flow: {
            title: 'Flow Rate Anomaly',
            description: 'Irregular flow patterns detected in entry process',
            recommendation: 'Review queue management and guide visitor flow'
          },
          timing: {
            title: 'Extended Wait Times',
            description: 'Average wait time exceeding 5-minute target',
            recommendation: 'Increase processing speed or implement fast-track lanes'
          }
        },
        'west-facilities': {
          congestion: {
            title: 'Facility Overcrowding',
            description: 'Restroom facilities approaching maximum capacity',
            recommendation: 'Direct visitors to alternative facilities or increase cleaning frequency'
          },
          capacity: {
            title: 'Utilization Rate High',
            description: 'Facility usage at 85% of recommended capacity',
            recommendation: 'Monitor closely and prepare overflow management'
          }
        },
        'exit-gate': {
          flow: {
            title: 'Exit Flow Bottleneck',
            description: 'Reduced exit flow rate creating backup',
            recommendation: 'Open additional exit lanes or expedite processing'
          },
          congestion: {
            title: 'Exit Congestion Warning',
            description: 'Higher than normal crowd density at exit points',
            recommendation: 'Implement crowd control measures and guide flow'
          }
        },
        'seating-area': {
          capacity: {
            title: 'Seating Density Alert',
            description: 'High occupancy density in seating sections',
            recommendation: 'Monitor crowd behavior and ensure adequate spacing'
          },
          timing: {
            title: 'Movement Pattern Change',
            description: 'Unusual movement patterns detected in seating area',
            recommendation: 'Investigate cause and provide guidance if needed'
          }
        }
      };

      const sectionTemplates = insightTemplates[section.id as keyof typeof insightTemplates];
      if (!sectionTemplates) continue;
      
      const template = (sectionTemplates as any)[type];
      if (!template) continue;
      
      insights.push({
          id: `${section.id}-${type}-${Date.now()}-${i}`,
          sectionId: section.id,
          sectionName: section.name,
          type,
          severity,
          title: template.title,
          description: template.description,
          recommendation: template.recommendation,
          metrics: {
            'Current Level': `${Math.floor(Math.random() * 100)}%`,
            'Threshold': '75%',
            'Duration': `${Math.floor(Math.random() * 30) + 5}min`,
            'Trend': Math.random() > 0.5 ? 'Increasing' : 'Stable'
          },
          timestamp: new Date(Date.now() - Math.random() * 3600000),
          isActive: true
        });
    }
  });

  return insights;
};

export const useSectionInsights = () => {
  const [sectionInsights, setSectionInsights] = useState<SectionInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load
    const loadInsights = () => {
      setLoading(true);
      setTimeout(() => {
        setSectionInsights(generateMockInsights());
        setLoading(false);
      }, 800);
    };

    loadInsights();

    // Update insights every 30 seconds
    const interval = setInterval(() => {
      setSectionInsights(prev => {
        // Only update if there are significant changes
        if (Math.random() > 0.7) {
          return generateMockInsights();
        }
        return prev;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    sectionInsights,
    loading
  };
};