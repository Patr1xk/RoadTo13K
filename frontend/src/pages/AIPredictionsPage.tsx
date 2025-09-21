import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FloorPlanCanvas } from '../components/FloorPlanCanvas';
import { PredictionSummaryPanel } from '../components/ai/PredictionSummaryPanel';
import { PredictionCharts } from '../components/ai/PredictionCharts';
import { PredictionControls } from '../components/ai/PredictionControls';
import { usePredictions } from '../hooks/usePredictions';
import { Zone, PredictionConfig } from '../types';
import '../styles/predictions.css';

const mockZones: Zone[] = [
  { id: 'entrance-1', name: 'Main Entrance', x: 10, y: 20, width: 15, height: 10, type: 'entrance', color: '#3B82F6' },
  { id: 'concourse-1', name: 'North Concourse', x: 30, y: 15, width: 40, height: 20, type: 'concourse', color: '#10B981' },
  { id: 'seating-1', name: 'Section A', x: 20, y: 45, width: 25, height: 30, type: 'seating', color: '#F59E0B' },
  { id: 'facility-1', name: 'Restrooms', x: 70, y: 25, width: 20, height: 15, type: 'facility', color: '#8B5CF6' },
  { id: 'exit-1', name: 'Emergency Exit', x: 85, y: 60, width: 12, height: 8, type: 'exit', color: '#EF4444' }
];

export const AIPredictionsPage: React.FC = () => {
  const [config, setConfig] = useState<PredictionConfig>({
    enabled: true,
    timeHorizon: 30,
    updateInterval: 10000,
    confidenceThreshold: 0.7,
    showOverlay: true,
    overlayOpacity: 0.6,
    colors: {
      low: '#22C55E',
      medium: '#F59E0B', 
      high: '#EF4444',
      critical: '#DC2626'
    }
  });

  const { predictions, summary, isLoading, error } = usePredictions(config);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-white mb-2">AI Crowd Predictions</h1>
          <p className="text-blue-200">AWS SageMaker-powered congestion forecasting</p>
        </motion.div>

        {/* Controls */}
        <PredictionControls config={config} onConfigChange={setConfig} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Floor Plan with Predictions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-2"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Predicted Congestion Areas</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-200">Prediction Overlay</span>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, showOverlay: !prev.showOverlay }))}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      config.showOverlay ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      config.showOverlay ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
              
              <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden">
                <FloorPlanCanvas
                  zones={mockZones}
                  predictions={predictions}
                  config={config}
                  showPredictions={config.showOverlay}
                />
              </div>
            </div>
          </motion.div>

          {/* Summary Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <PredictionSummaryPanel summary={summary} isLoading={isLoading} />
          </motion.div>
        </div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PredictionCharts predictions={predictions} config={config} />
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/20 border border-red-500/30 rounded-lg p-4"
          >
            <p className="text-red-200">Error loading predictions: {error}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};