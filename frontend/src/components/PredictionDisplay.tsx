import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface PredictionDisplayProps {
  venue: Venue;
  demoResults: DemoResults | null;
  evaluationMetrics: EvaluationMetrics | null;
  settings: PredictionSettings;
}

const PredictionDisplay: React.FC<PredictionDisplayProps> = ({
  venue,
  demoResults,
  evaluationMetrics,
  settings
}) => {
  const [activeTab, setActiveTab] = useState<'demo' | 'metrics' | 'heatmap'>('demo');
  const [showOverlay, setShowOverlay] = useState(true);

  // Generate mock heatmap data based on venue type
  const generateHeatmapData = () => {
    const zones: Array<{
      id: number;
      name: string;
      congestion: number;
      prediction: number;
      riskLevel: 'low' | 'medium' | 'high';
    }> = [];
    const baseZones = venue.type === 'stadium' ? 
      ['Entry Gates', 'Concourses', 'Seating Areas', 'Exit Points'] :
      venue.type === 'mall' ?
      ['Main Entrance', 'Food Court', 'Shopping Areas', 'Parking'] :
      venue.type === 'airport' ?
      ['Check-in', 'Security', 'Departure Gates', 'Baggage Claim'] :
      ['Entry Queue', 'Concert Hall', 'VIP Areas', 'Emergency Exits'];

    baseZones.forEach((zone, index) => {
      zones.push({
        id: index + 1,
        name: zone,
        congestion: Math.random() * 100,
        prediction: Math.random() * 100,
        riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
      });
    });

    return zones;
  };

  const heatmapData = generateHeatmapData();

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-white/20">
        {[
          { id: 'demo', label: 'Demo Results', icon: '📊', available: !!demoResults },
          { id: 'metrics', label: 'Performance', icon: '⚡', available: !!evaluationMetrics },
          { id: 'heatmap', label: 'Live Heatmap', icon: '🔥', available: true }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.id as any)}
            disabled={!tab.available}
            className={`
              flex-1 p-4 font-medium transition-all duration-300
              ${activeTab === tab.id
                ? 'bg-blue-500/30 text-white border-b-2 border-blue-400'
                : tab.available
                ? 'text-gray-300 hover:text-white hover:bg-white/5'
                : 'text-gray-600 cursor-not-allowed'
              }
            `}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {!tab.available && <span className="text-xs">📋</span>}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Demo Results Tab */}
          {activeTab === 'demo' && demoResults && (
            <motion.div
              key="demo"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📊</span>
                AI Prediction Results
              </h3>

              {/* Scenario Results */}
              {demoResults.scenario_results.map((scenario, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-6 border border-purple-400/30"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-white flex items-center">
                      <span className="mr-2">{scenario.scenario.id === 1 ? '🏢' : scenario.scenario.id === 2 ? '🏟️' : '🎵'}</span>
                      {scenario.scenario.name}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      scenario.traditional_ml.prediction.risk_score > 0.8 ? 'bg-red-500/30 text-red-300' :
                      scenario.traditional_ml.prediction.risk_score > 0.6 ? 'bg-yellow-500/30 text-yellow-300' :
                      'bg-green-500/30 text-green-300'
                    }`}>
                      Risk: {(scenario.traditional_ml.prediction.risk_score * 100).toFixed(0)}%
                    </span>
                  </div>

                  <p className="text-blue-200 mb-4">{scenario.scenario.description}</p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Traditional ML */}
                    <div className="bg-black/30 rounded-lg p-4">
                      <h5 className="text-green-400 font-semibold mb-3 flex items-center">
                        <span className="mr-2">🤖</span>
                        Traditional ML
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Confidence:</span>
                          <span className="text-white">{(scenario.traditional_ml.prediction.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Wait Time:</span>
                          <span className="text-white">{scenario.traditional_ml.prediction.wait_time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Processing:</span>
                          <span className="text-green-300">{scenario.traditional_ml.processing_time}</span>
                        </div>
                      </div>
                    </div>

                    {/* SageMaker AI */}
                    <div className="bg-black/30 rounded-lg p-4">
                      <h5 className="text-blue-400 font-semibold mb-3 flex items-center">
                        <span className="mr-2">🧠</span>
                        SageMaker AI
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Confidence:</span>
                          <span className="text-white">{(scenario.sagemaker_ai.prediction.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Wait Time:</span>
                          <span className="text-white">{scenario.sagemaker_ai.prediction.wait_time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Processing:</span>
                          <span className="text-blue-300">{scenario.sagemaker_ai.processing_time}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cultural Insights */}
                  {scenario.sagemaker_ai.prediction.cultural_insights && (
                    <div className="mt-4 p-3 bg-yellow-600/20 rounded border border-yellow-400/30">
                      <h6 className="text-yellow-300 font-semibold mb-2">🇲🇾 Cultural Insights:</h6>
                      <p className="text-white text-sm">{scenario.sagemaker_ai.prediction.cultural_insights}</p>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Summary */}
              {demoResults.demo_summary && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-6 border border-green-400/30"
                >
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="mr-2">📈</span>
                    Demo Summary
                  </h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-300">{demoResults.demo_summary.total_scenarios_tested}</div>
                      <div className="text-sm text-gray-300">Scenarios Tested</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-300">{demoResults.demo_summary.systems_compared}</div>
                      <div className="text-sm text-gray-300">AI Systems</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-300">~10s</div>
                      <div className="text-sm text-gray-300">Processing Time</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-300">100%</div>
                      <div className="text-sm text-gray-300">Malaysian Ready</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Performance Metrics Tab */}
          {activeTab === 'metrics' && evaluationMetrics && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">⚡</span>
                System Performance
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Traditional ML Performance */}
                <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg p-6 border border-green-400/30">
                  <h4 className="text-xl font-bold text-green-300 mb-4">🤖 Traditional ML</h4>
                  <div className="space-y-3">
                    {Object.entries(evaluationMetrics.system_performance.traditional_ml).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-gray-300 capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="text-white font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SageMaker AI Performance */}
                <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg p-6 border border-blue-400/30">
                  <h4 className="text-xl font-bold text-blue-300 mb-4">🧠 SageMaker AI</h4>
                  <div className="space-y-3">
                    {Object.entries(evaluationMetrics.system_performance.sagemaker_ai).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-gray-300 capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="text-white font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cost Analysis */}
              {evaluationMetrics.cost_analysis && (
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-6 border border-purple-400/30">
                  <h4 className="text-xl font-bold text-purple-300 mb-4 flex items-center">
                    <span className="mr-2">💰</span>
                    Cost Analysis
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-300">$0.0001</div>
                      <div className="text-sm text-gray-300">Traditional ML / prediction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-300">$0.01</div>
                      <div className="text-sm text-gray-300">SageMaker AI / prediction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-300">&lt;$51</div>
                      <div className="text-sm text-gray-300">Total monthly cost</div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Live Heatmap Tab */}
          {activeTab === 'heatmap' && (
            <motion.div
              key="heatmap"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <span className="mr-2">🔥</span>
                  Live Crowd Heatmap
                </h3>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowOverlay(!showOverlay)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    showOverlay 
                      ? 'bg-blue-500/30 border border-blue-400 text-blue-300' 
                      : 'bg-gray-600/30 border border-gray-500 text-gray-400'
                  }`}
                >
                  {showOverlay ? '👁️ Hide Overlay' : '👁️‍🗨️ Show Overlay'}
                </motion.button>
              </div>

              {/* Venue Visualization */}
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-8 border border-gray-600">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-64">
                  {heatmapData.map((zone, index) => (
                    <motion.div
                      key={zone.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`
                        relative rounded-lg p-4 border-2 cursor-pointer transition-all duration-300
                        ${zone.riskLevel === 'high' ? 'bg-red-500/30 border-red-400' :
                          zone.riskLevel === 'medium' ? 'bg-yellow-500/30 border-yellow-400' :
                          'bg-green-500/30 border-green-400'
                        }
                      `}
                      style={{ opacity: showOverlay ? settings.overlayOpacity : 1 }}
                      whileHover={{ scale: 1.05, z: 10 }}
                    >
                      {/* Zone Content */}
                      <div className="text-center">
                        <div className="text-2xl mb-2">
                          {venue.type === 'stadium' ? '🏟️' : 
                           venue.type === 'mall' ? '🏢' :
                           venue.type === 'airport' ? '✈️' : '🎵'}
                        </div>
                        <h5 className="text-white font-semibold text-sm mb-1">{zone.name}</h5>
                        <div className="text-xs text-gray-300">
                          {zone.congestion.toFixed(0)}% full
                        </div>
                      </div>

                      {/* Animated Pulse for High Risk */}
                      {zone.riskLevel === 'high' && (
                        <motion.div
                          className="absolute inset-0 rounded-lg bg-red-500/20"
                          animate={{ opacity: [0, 0.5, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Overlay Information */}
                {showOverlay && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-4 right-4 bg-black/80 rounded-lg p-3 border border-white/20"
                  >
                    <h6 className="text-white font-semibold mb-2">🎯 Prediction Overlay</h6>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-green-300">Low Risk</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                        <span className="text-yellow-300">Medium Risk</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span className="text-red-300">High Risk</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Zone Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {heatmapData.slice(0, 4).map((zone) => (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/30 rounded-lg p-4 border border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-white font-medium">{zone.name}</h5>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        zone.riskLevel === 'high' ? 'bg-red-500/30 text-red-300' :
                        zone.riskLevel === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
                        'bg-green-500/30 text-green-300'
                      }`}>
                        {zone.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Density:</span>
                        <span className="text-white">{zone.congestion.toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Predicted Peak:</span>
                        <span className="text-yellow-300">{zone.prediction.toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Time to Peak:</span>
                        <span className="text-blue-300">{settings.timeHorizon} min</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* No Data State */}
          {((activeTab === 'demo' && !demoResults) || (activeTab === 'metrics' && !evaluationMetrics)) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">No Data Available</h3>
              <p className="text-gray-400 mb-6">
                {activeTab === 'demo' 
                  ? 'Run a demo prediction to see AI analysis results'
                  : 'Fetch evaluation metrics to see system performance data'
                }
              </p>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-blue-400"
              >
                👆 Use the controls on the left to get started
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PredictionDisplay;