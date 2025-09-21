import React from 'react';
import { motion } from 'framer-motion';

interface Venue {
  id: string;
  name: string;
  type: 'stadium' | 'mall' | 'airport' | 'concert_hall';
  icon: string;
  description: string;
  malaysianLocation: string;
}

interface PredictionControlsProps {
  venue: Venue;
  onRunDemo: () => void;
  onGetResults: () => void;
  isLoading: boolean;
  hasResults: boolean;
  hasMetrics: boolean;
}

const PredictionControls: React.FC<PredictionControlsProps> = ({
  venue,
  onRunDemo,
  onGetResults,
  isLoading,
  hasResults,
  hasMetrics
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <span className="mr-2">🎛️</span>
        Prediction Controls
      </h3>

      {/* Venue Context */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-400/30">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-2xl">{venue.icon}</span>
          <div>
            <h4 className="text-white font-semibold">{venue.name}</h4>
            <p className="text-blue-200 text-sm">{venue.malaysianLocation}</p>
          </div>
        </div>
        <p className="text-gray-300 text-sm">{venue.description}</p>
      </div>

      {/* Main Action Buttons */}
      <div className="space-y-4">
        {/* Run Demo Prediction Button */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRunDemo}
          disabled={isLoading}
          className={`
            w-full p-4 rounded-lg font-bold text-lg transition-all duration-300
            ${isLoading
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-lg hover:shadow-xl'
            }
            text-white border-2 border-green-400/50
          `}
        >
          <div className="flex items-center justify-center space-x-3">
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span className="text-xl">🚀</span>
                <span>Run Demo Prediction</span>
              </>
            )}
          </div>
          
          {!isLoading && (
            <div className="text-sm opacity-80 mt-1">
              Analyze crowd patterns for {venue.name}
            </div>
          )}
        </motion.button>

        {/* Get Results Button */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGetResults}
          disabled={isLoading}
          className={`
            w-full p-4 rounded-lg font-bold text-lg transition-all duration-300
            ${isLoading
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 shadow-lg hover:shadow-xl'
            }
            text-white border-2 border-blue-400/50
          `}
        >
          <div className="flex items-center justify-center space-x-3">
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span className="text-xl">📊</span>
                <span>Get Prediction Results</span>
              </>
            )}
          </div>
          
          {!isLoading && (
            <div className="text-sm opacity-80 mt-1">
              Fetch system performance metrics
            </div>
          )}
        </motion.button>
      </div>

      {/* API Status */}
      <div className="mt-6 p-4 bg-black/20 rounded-lg border border-gray-600/30">
        <h4 className="text-white font-semibold mb-3 flex items-center">
          <span className="mr-2">📡</span>
          API Status
        </h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Demo Endpoint:</span>
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 bg-green-400 rounded-full"
              />
              <span className="text-green-400">Live</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Evaluation Endpoint:</span>
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 bg-green-400 rounded-full"
              />
              <span className="text-green-400">Live</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Results Available:</span>
            <span className={hasResults ? 'text-green-400' : 'text-gray-500'}>
              {hasResults ? '✓ Demo Data' : '⚪ No Data'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Metrics Available:</span>
            <span className={hasMetrics ? 'text-green-400' : 'text-gray-500'}>
              {hasMetrics ? '✓ Performance Data' : '⚪ No Data'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h4 className="text-white font-semibold mb-3 flex items-center">
          <span className="mr-2">⚡</span>
          Quick Actions
        </h4>
        
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { onRunDemo(); setTimeout(onGetResults, 2000); }}
            disabled={isLoading}
            className="p-2 bg-purple-600/30 hover:bg-purple-600/50 rounded border border-purple-400/50 text-white text-sm transition-colors"
          >
            🔄 Run Both
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-orange-600/30 hover:bg-orange-600/50 rounded border border-orange-400/50 text-white text-sm transition-colors"
            onClick={() => window.open('https://91tci351oe.execute-api.us-east-1.amazonaws.com/prod/evaluation', '_blank')}
          >
            🔗 Direct API
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default PredictionControls;