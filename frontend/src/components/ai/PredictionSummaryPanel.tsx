import React from 'react';
import { motion } from 'framer-motion';
import { PredictionSummary } from '../../types';

interface PredictionSummaryPanelProps {
  summary: PredictionSummary | null;
  isLoading: boolean;
}

export const PredictionSummaryPanel: React.FC<PredictionSummaryPanelProps> = ({
  summary,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/20 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-white/20 rounded"></div>
            <div className="h-4 bg-white/20 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-green-400 bg-green-500/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Prediction Overview</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{summary.totalPredictions}</div>
            <div className="text-sm text-blue-200">Total Predictions</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{summary.highRiskZones}</div>
            <div className="text-sm text-red-200">High Risk Zones</div>
          </div>
          
          <div className="text-center col-span-2">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(summary.avgConfidence * 100)}%
            </div>
            <div className="text-sm text-green-200">Avg Confidence</div>
          </div>
        </div>
      </motion.div>

      {/* Next Bottleneck Alert */}
      {summary.nextBottleneck && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Next Bottleneck</h3>
          
          <div className={`p-4 rounded-lg ${getSeverityColor(summary.nextBottleneck.severity)}`}>
            <div className="font-semibold">{summary.nextBottleneck.zoneName}</div>
            <div className="text-sm opacity-90">
              Expected in {summary.nextBottleneck.timeToOccur} minutes
            </div>
            <div className="text-xs mt-2 capitalize">
              Severity: {summary.nextBottleneck.severity}
            </div>
          </div>
        </motion.div>
      )}

      {/* Recommended Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Recommended Actions</h3>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {summary.recommendedActions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 rounded-lg p-3 border border-white/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span>{getPriorityIcon(action.priority)}</span>
                    <span className="font-medium text-white text-sm">{action.title}</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">{action.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                    <span>Impact: {action.estimatedImpact}%</span>
                    <span>Time: {action.timeToImplement}min</span>
                  </div>
                </div>
                
                <button className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded text-xs hover:bg-blue-500/30 transition-colors">
                  Apply
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};