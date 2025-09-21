import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VenueSelector from './VenueSelector';
import PredictionControls from './PredictionControls';
import UserInputControls from './UserInputControls';
import PredictionDisplay from './PredictionDisplay';
import '../styles/ai-dashboard.css';

interface Venue {
  id: string;
  name: string;
  type: 'stadium' | 'mall' | 'airport' | 'concert_hall';
  icon: string;
  description: string;
  malaysianLocation: string;
}

interface PredictionSettings {
  timeHorizon: number;
  confidenceThreshold: number;
  overlayOpacity: number;
  alertLevel: 'low' | 'medium' | 'high';
}

interface DemoResults {
  demo_summary: any;
  scenario_results: any[];
  timestamp: string;
}

interface EvaluationMetrics {
  system_performance: any;
  cost_analysis: any;
  deployment_status: any;
}

const venues: Venue[] = [
  {
    id: 'stadium',
    name: 'Bukit Jalil Stadium',
    type: 'stadium',
    icon: '🏟️',
    description: 'National Stadium - Malaysia vs Thailand',
    malaysianLocation: 'Kuala Lumpur'
  },
  {
    id: 'mall',
    name: 'KLCC Twin Towers',
    type: 'mall',
    icon: '🏢',
    description: 'New Year Countdown Festival',
    malaysianLocation: 'Kuala Lumpur'
  },
  {
    id: 'airport',
    name: 'KLIA Terminal',
    type: 'airport',
    icon: '✈️',
    description: 'International Arrivals Hub',
    malaysianLocation: 'Sepang'
  },
  {
    id: 'concert',
    name: 'Axiata Arena',
    type: 'concert_hall',
    icon: '🎵',
    description: 'International Artist Concert',
    malaysianLocation: 'Bukit Jalil'
  }
];

const AIPredictionDashboard: React.FC = () => {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [demoResults, setDemoResults] = useState<DemoResults | null>(null);
  const [evaluationMetrics, setEvaluationMetrics] = useState<EvaluationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionSettings, setPredictionSettings] = useState<PredictionSettings>({
    timeHorizon: 30,
    confidenceThreshold: 0.8,
    overlayOpacity: 0.7,
    alertLevel: 'medium'
  });

  const API_BASE = 'https://jzmnoru4sa.execute-api.us-east-1.amazonaws.com/test';

  const runDemoPrediction = async () => {
    if (!selectedVenue) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/run-demo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          venue_type: selectedVenue.type,
          venue_name: selectedVenue.name,
          settings: predictionSettings
        })
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('API error response:', text);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let result = null;
      try {
        result = await response.json();
      } catch (jsonErr) {
        console.error('Failed to parse JSON:', jsonErr);
        throw new Error('Invalid JSON response from API');
      }

      // Handle Lambda/API Gateway response with stringified body
      let parsed = result;
      if (parsed && typeof parsed.body === 'string') {
        try {
          parsed = JSON.parse(parsed.body);
        } catch (e) {
          // leave as is
        }
      }
      console.log('Parsed API response:', parsed);
      if (parsed && parsed.success) {
        setDemoResults(parsed.data);
      } else {
        throw new Error('Demo prediction failed: ' + JSON.stringify(parsed));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo prediction failed');
      console.error('Demo prediction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getEvaluationResults = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/evaluation`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setEvaluationMetrics(result.data);
      } else {
        throw new Error('Evaluation fetch failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Evaluation fetch failed');
      console.error('Evaluation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVenueSelect = (venue: Venue) => {
    setSelectedVenue(venue);
    setDemoResults(null);
    setEvaluationMetrics(null);
    setError(null);
  };

  const handleSettingsChange = (newSettings: Partial<PredictionSettings>) => {
    setPredictionSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            🇲🇾 AI Prediction Dashboard
          </h1>
          <p className="text-blue-200 text-lg">
            Malaysian Crowd Control Intelligence System
          </p>
        </motion.div>

        {/* Venue Selection */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <VenueSelector
            venues={venues}
            selectedVenue={selectedVenue}
            onVenueSelect={handleVenueSelect}
          />
        </motion.div>

        {/* Main Dashboard Content */}
        <AnimatePresence mode="wait">
          {selectedVenue && (
            <motion.div
              key={selectedVenue.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Panel: Controls */}
              <div className="lg:col-span-1 space-y-6">
                {/* Prediction Controls */}
                <PredictionControls
                  venue={selectedVenue}
                  onRunDemo={runDemoPrediction}
                  onGetResults={getEvaluationResults}
                  isLoading={isLoading}
                  hasResults={!!demoResults}
                  hasMetrics={!!evaluationMetrics}
                />

                {/* User Input Controls */}
                <UserInputControls
                  settings={predictionSettings}
                  onSettingsChange={handleSettingsChange}
                />
              </div>

              {/* Right Panel: Prediction Display */}
              <div className="lg:col-span-2">
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center h-96"
                  >
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full"
                    />
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-2">Processing AI predictions...</h3>
                      <p className="text-blue-200">Analyzing crowd patterns for {selectedVenue.name}</p>
                    </div>
                  </div>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/20 border border-red-500 rounded-lg p-6 text-center"
                  >
                    <div className="text-red-400 text-xl mb-2">⚠️ Error</div>
                    <div className="text-white">{error}</div>
                    <button
                      onClick={() => setError(null)}
                      className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Dismiss
                    </button>
                  </motion.div>
                )}

                {!isLoading && !error && (demoResults || evaluationMetrics) && (
                  <PredictionDisplay
                    venue={selectedVenue}
                    demoResults={demoResults}
                    evaluationMetrics={evaluationMetrics}
                    settings={predictionSettings}
                  />
                )}

                {!isLoading && !error && !demoResults && !evaluationMetrics && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center border border-white/20"
                  >
                    <div className="text-6xl mb-4">{selectedVenue.icon}</div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {selectedVenue.name}
                    </h3>
                    <p className="text-blue-200 mb-4">{selectedVenue.description}</p>
                    <p className="text-blue-300">📍 {selectedVenue.malaysianLocation}</p>
                    <div className="mt-6 text-gray-300">
                      Run a prediction to see AI-powered crowd analysis
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Venue Selected State */}
        {!selectedVenue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🏛️</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Select a Venue to Begin
            </h2>
            <p className="text-blue-200">
              Choose from Malaysian venues to start AI-powered crowd predictions
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AIPredictionDashboard;