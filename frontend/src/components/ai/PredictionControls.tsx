import React from 'react';
import { motion } from 'framer-motion';
import { PredictionConfig } from '../../types';

interface PredictionControlsProps {
  config: PredictionConfig;
  onConfigChange: (config: PredictionConfig) => void;
}

export const PredictionControls: React.FC<PredictionControlsProps> = ({
  config,
  onConfigChange
}) => {
  const timeHorizonOptions = [
    { value: 5, label: '5 min' },
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 60, label: '1 hour' }
  ];

  const confidenceOptions = [
    { value: 0.5, label: '50%' },
    { value: 0.7, label: '70%' },
    { value: 0.8, label: '80%' },
    { value: 0.9, label: '90%' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Time Horizon */}
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-white">Time Horizon:</label>
          <div className="flex space-x-1">
            {timeHorizonOptions.map(option => (
              <button
                key={option.value}
                onClick={() => onConfigChange({ ...config, timeHorizon: option.value })}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  config.timeHorizon === option.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Confidence Threshold */}
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-white">Min Confidence:</label>
          <div className="flex space-x-1">
            {confidenceOptions.map(option => (
              <button
                key={option.value}
                onClick={() => onConfigChange({ ...config, confidenceThreshold: option.value })}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  config.confidenceThreshold === option.value
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overlay Opacity */}
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-white">Overlay Opacity:</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={config.overlayOpacity}
            onChange={(e) => onConfigChange({ 
              ...config, 
              overlayOpacity: parseFloat(e.target.value) 
            })}
            className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-sm text-gray-300 min-w-8">
            {Math.round(config.overlayOpacity * 100)}%
          </span>
        </div>

        {/* Enable/Disable */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-white">Predictions</span>
          <button
            onClick={() => onConfigChange({ ...config, enabled: !config.enabled })}
            className={`w-12 h-6 rounded-full transition-colors ${
              config.enabled ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
              config.enabled ? 'translate-x-7' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};