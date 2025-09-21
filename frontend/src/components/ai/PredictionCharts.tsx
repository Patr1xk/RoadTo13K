import React from 'react';
import { motion } from 'framer-motion';
import { CongestionPrediction, PredictionConfig } from '../../types';

interface PredictionChartsProps {
  predictions: CongestionPrediction[];
  config: PredictionConfig;
}

export const PredictionCharts: React.FC<PredictionChartsProps> = ({
  predictions,
  config
}) => {
  const severityData = predictions.reduce((acc, pred) => {
    acc[pred.severity] = (acc[pred.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const probabilityRanges = predictions.reduce((acc, pred) => {
    const range = pred.probability >= 0.8 ? 'high' : pred.probability >= 0.5 ? 'medium' : 'low';
    acc[range] = (acc[range] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getSeverityColor = (severity: string) => {
    return config.colors[severity as keyof typeof config.colors] || '#6B7280';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Severity Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Congestion Severity</h3>
        
        <div className="space-y-3">
          {Object.entries(severityData).map(([severity, count]) => {
            const percentage = (count / predictions.length) * 100;
            return (
              <div key={severity} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300 capitalize">{severity}</span>
                  <span className="text-white">{count} zones</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-2 rounded-full"
                    style={{ backgroundColor: getSeverityColor(severity) }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Probability Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Prediction Confidence</h3>
        
        <div className="space-y-3">
          {Object.entries(probabilityRanges).map(([range, count]) => {
            const percentage = (count / predictions.length) * 100;
            const color = range === 'high' ? '#10B981' : range === 'medium' ? '#F59E0B' : '#6B7280';
            return (
              <div key={range} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300 capitalize">{range} Confidence</span>
                  <span className="text-white">{count} predictions</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Timeline Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Predicted Timeline</h3>
        
        <div className="relative h-32 bg-gray-800 rounded-lg p-4 overflow-x-auto">
          <div className="flex items-end justify-between h-full space-x-2">
            {predictions.slice(0, 10).map((pred, index) => {
              const height = (pred.probability * 80) + 10;
              const timeFromNow = Math.floor(Math.random() * 60) + 5; // Mock time calculation
              
              return (
                <motion.div
                  key={pred.zoneId}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="flex-1 min-w-8 rounded-t group relative cursor-pointer"
                  style={{ backgroundColor: getSeverityColor(pred.severity) }}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <div>{pred.zoneName}</div>
                    <div>+{timeFromNow}min</div>
                    <div>{Math.round(pred.probability * 100)}%</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Now</span>
            <span>+{config.timeHorizon}min</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};