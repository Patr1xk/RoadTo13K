import { useState, useEffect } from 'react';
import { CongestionPrediction, PredictionSummary, PredictionConfig, SageMakerResponse } from '../types';

// Mock SageMaker API call
const mockSageMakerAPI = async (config: PredictionConfig): Promise<SageMakerResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockPredictions: CongestionPrediction[] = [
    {
      zoneId: 'entrance-1',
      zoneName: 'Main Entrance',
      predictedTime: new Date(Date.now() + 15 * 60000),
      severity: 'high',
      probability: 0.85,
      confidence: 0.92,
      expectedDuration: 12,
      peakOccupancy: 450,
      riskScore: 78,
      factors: ['Event start time', 'Weather conditions', 'Transport delays'],
      recommendations: ['Deploy additional staff', 'Open secondary entrance']
    },
    {
      zoneId: 'concourse-1',
      zoneName: 'North Concourse',
      predictedTime: new Date(Date.now() + 25 * 60000),
      severity: 'medium',
      probability: 0.72,
      confidence: 0.88,
      expectedDuration: 8,
      peakOccupancy: 320,
      riskScore: 65,
      factors: ['Halftime rush', 'Concession demand'],
      recommendations: ['Increase concession capacity', 'Guide crowd flow']
    },
    {
      zoneId: 'facility-1',
      zoneName: 'Restrooms',
      predictedTime: new Date(Date.now() + 35 * 60000),
      severity: 'critical',
      probability: 0.91,
      confidence: 0.95,
      expectedDuration: 15,
      peakOccupancy: 180,
      riskScore: 89,
      factors: ['Intermission period', 'Limited facilities'],
      recommendations: ['Open additional facilities', 'Deploy queue management']
    }
  ];

  const filteredPredictions = mockPredictions.filter(
    pred => pred.confidence >= config.confidenceThreshold
  );

  const summary: PredictionSummary = {
    totalPredictions: filteredPredictions.length,
    highRiskZones: filteredPredictions.filter(p => p.severity === 'high' || p.severity === 'critical').length,
    avgConfidence: filteredPredictions.reduce((sum, p) => sum + p.confidence, 0) / filteredPredictions.length,
    nextBottleneck: filteredPredictions.length > 0 ? {
      zoneId: filteredPredictions[0].zoneId,
      zoneName: filteredPredictions[0].zoneName,
      timeToOccur: 15,
      severity: filteredPredictions[0].severity
    } : null,
    recommendedActions: [
      {
        id: '1',
        type: 'staff-deployment',
        priority: 'high',
        title: 'Deploy Additional Staff',
        description: 'Increase staffing at main entrance before predicted congestion',
        targetZones: ['entrance-1'],
        estimatedImpact: 35,
        timeToImplement: 5,
        status: 'suggested'
      },
      {
        id: '2',
        type: 'redirect',
        priority: 'medium',
        title: 'Activate Alternative Routes',
        description: 'Guide visitors through secondary pathways',
        targetZones: ['concourse-1'],
        estimatedImpact: 25,
        timeToImplement: 3,
        status: 'suggested'
      }
    ]
  };

  return {
    predictions: filteredPredictions,
    heatmaps: [],
    summary,
    modelInfo: {
      id: 'crowd-prediction-v2',
      name: 'Crowd Congestion Predictor',
      version: '2.1.0',
      endpoint: 'sagemaker-crowd-model-endpoint',
      confidence: 0.89,
      lastTrained: new Date('2024-01-15')
    },
    timestamp: new Date()
  };
};

export const usePredictions = (config: PredictionConfig) => {
  const [predictions, setPredictions] = useState<CongestionPrediction[]>([]);
  const [summary, setSummary] = useState<PredictionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config.enabled) {
      setPredictions([]);
      setSummary(null);
      return;
    }

    const fetchPredictions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await mockSageMakerAPI(config);
        setPredictions(response.predictions);
        setSummary(response.summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch predictions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();

    // Set up periodic updates
    const interval = setInterval(fetchPredictions, config.updateInterval);
    return () => clearInterval(interval);
  }, [config]);

  return {
    predictions,
    summary,
    isLoading,
    error
  };
};