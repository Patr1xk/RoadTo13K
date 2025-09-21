import React from 'react';
import { motion } from 'framer-motion';

interface PredictionSettings {
  timeHorizon: number;
  confidenceThreshold: number;
  overlayOpacity: number;
  alertLevel: 'low' | 'medium' | 'high';
}

interface UserInputControlsProps {
  settings: PredictionSettings;
  onSettingsChange: (newSettings: Partial<PredictionSettings>) => void;
}

const UserInputControls: React.FC<UserInputControlsProps> = ({
  settings,
  onSettingsChange
}) => {
  const handleSliderChange = (key: keyof PredictionSettings, value: number) => {
    onSettingsChange({ [key]: value });
  };

  const handleAlertLevelChange = (level: 'low' | 'medium' | 'high') => {
    onSettingsChange({ alertLevel: level });
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <span className="mr-2">⚙️</span>
        Prediction Settings
      </h3>

      <div className="space-y-6">
        {/* Time Horizon Control */}
        <div>
          <label className="block text-white font-medium mb-3 flex items-center justify-between">
            <span className="flex items-center">
              <span className="mr-2">⏰</span>
              Time Horizon
            </span>
            <span className="text-yellow-300 font-bold">{settings.timeHorizon} min</span>
          </label>
          
          <div className="relative">
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={settings.timeHorizon}
              onChange={(e) => handleSliderChange('timeHorizon', Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            
            {/* Slider Visual Feedback */}
            <motion.div
              className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg pointer-events-none"
              style={{ width: `${(settings.timeHorizon - 5) / 115 * 100}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${(settings.timeHorizon - 5) / 115 * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5 min</span>
            <span>60 min</span>
            <span>120 min</span>
          </div>
        </div>

        {/* Confidence Threshold Control */}
        <div>
          <label className="block text-white font-medium mb-3 flex items-center justify-between">
            <span className="flex items-center">
              <span className="mr-2">🎯</span>
              Confidence Threshold
            </span>
            <span className="text-yellow-300 font-bold">{(settings.confidenceThreshold * 100).toFixed(0)}%</span>
          </label>
          
          <div className="relative">
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={settings.confidenceThreshold}
              onChange={(e) => handleSliderChange('confidenceThreshold', Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            
            <motion.div
              className="absolute top-0 left-0 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg pointer-events-none"
              style={{ width: `${(settings.confidenceThreshold - 0.5) / 0.45 * 100}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${(settings.confidenceThreshold - 0.5) / 0.45 * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>50%</span>
            <span>75%</span>
            <span>95%</span>
          </div>
        </div>

        {/* Overlay Opacity Control */}
        <div>
          <label className="block text-white font-medium mb-3 flex items-center justify-between">
            <span className="flex items-center">
              <span className="mr-2">👁️</span>
              Overlay Opacity
            </span>
            <span className="text-yellow-300 font-bold">{(settings.overlayOpacity * 100).toFixed(0)}%</span>
          </label>
          
          <div className="relative">
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={settings.overlayOpacity}
              onChange={(e) => handleSliderChange('overlayOpacity', Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            
            <motion.div
              className="absolute top-0 left-0 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg pointer-events-none"
              style={{ width: `${(settings.overlayOpacity - 0.1) / 0.9 * 100}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${(settings.overlayOpacity - 0.1) / 0.9 * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Alert Level Control */}
        <div>
          <label className="block text-white font-medium mb-3 flex items-center">
            <span className="mr-2">🚨</span>
            Alert Level
          </label>
          
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as const).map((level) => (
              <motion.button
                key={level}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAlertLevelChange(level)}
                className={`
                  p-3 rounded-lg font-medium transition-all duration-300 border-2
                  ${settings.alertLevel === level
                    ? level === 'low'
                      ? 'bg-green-500/30 border-green-400 text-green-300'
                      : level === 'medium'
                      ? 'bg-yellow-500/30 border-yellow-400 text-yellow-300'
                      : 'bg-red-500/30 border-red-400 text-red-300'
                    : 'bg-gray-700/30 border-gray-600 text-gray-400 hover:border-gray-400'
                  }
                `}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">
                    {level === 'low' ? '🟢' : level === 'medium' ? '🟡' : '🔴'}
                  </div>
                  <div className="text-sm capitalize">{level}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className="border-t border-gray-600/50 pt-6">
          <details className="group">
            <summary className="text-white font-medium cursor-pointer flex items-center justify-between hover:text-blue-300 transition-colors">
              <span className="flex items-center">
                <span className="mr-2">🔧</span>
                Advanced Options
              </span>
              <motion.span
                className="text-xl"
                animate={{ rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                ▼
              </motion.span>
            </summary>
            
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 space-y-4"
            >
              {/* Real-time Updates Toggle */}
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                <span className="text-white flex items-center">
                  <span className="mr-2">🔄</span>
                  Real-time Updates
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-6 bg-gray-600 rounded-full p-1 transition-colors duration-300"
                >
                  <motion.div
                    className="w-4 h-4 bg-white rounded-full"
                    layout
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </div>

              {/* Auto-refresh Interval */}
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                <span className="text-white flex items-center">
                  <span className="mr-2">⏱️</span>
                  Auto-refresh (sec)
                </span>
                <select className="bg-gray-700 text-white rounded px-2 py-1 text-sm">
                  <option value="5">5s</option>
                  <option value="10">10s</option>
                  <option value="30">30s</option>
                  <option value="60">60s</option>
                </select>
              </div>
            </motion.div>
          </details>
        </div>

        {/* Settings Summary */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-400/30">
          <h4 className="text-white font-semibold mb-2 flex items-center">
            <span className="mr-2">📋</span>
            Current Settings
          </h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between text-gray-300">
              <span>Prediction Window:</span>
              <span className="text-yellow-300">{settings.timeHorizon} minutes</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Confidence Level:</span>
              <span className="text-yellow-300">{(settings.confidenceThreshold * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Visualization:</span>
              <span className="text-yellow-300">{(settings.overlayOpacity * 100).toFixed(0)}% opacity</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Alert Sensitivity:</span>
              <span className={`capitalize ${
                settings.alertLevel === 'low' ? 'text-green-300' :
                settings.alertLevel === 'medium' ? 'text-yellow-300' : 'text-red-300'
              }`}>
                {settings.alertLevel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInputControls;