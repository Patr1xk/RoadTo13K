import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Users, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { SectionInsight } from '../../types';

interface SectionInsightsProps {
  sectionId: string;
  insights: SectionInsight[];
  loading: boolean;
}

export const SectionInsights: React.FC<SectionInsightsProps> = ({
  sectionId,
  insights,
  loading
}) => {
  const getSectionLayout = (sectionId: string) => {
    switch (sectionId) {
      case 'main-entrance':
        return {
          title: 'Main Entrance Analytics',
          metrics: ['Queue Length', 'Processing Rate', 'Wait Time', 'Throughput'],
          layout: 'queue'
        };
      case 'west-facilities':
        return {
          title: 'West Facilities Analytics',
          metrics: ['Occupancy', 'Dwell Time', 'Utilization', 'Capacity'],
          layout: 'facility'
        };
      case 'exit-gate':
        return {
          title: 'Exit Gate Analytics',
          metrics: ['Exit Rate', 'Congestion', 'Flow Speed', 'Bottlenecks'],
          layout: 'exit'
        };
      case 'seating-area':
        return {
          title: 'Seating Area Analytics',
          metrics: ['Occupancy Rate', 'Movement', 'Density', 'Comfort Level'],
          layout: 'seating'
        };
      default:
        return {
          title: 'Section Analytics',
          metrics: ['General Metrics'],
          layout: 'default'
        };
    }
  };

  const sectionConfig = getSectionLayout(sectionId);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'congestion': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'capacity': return <Users className="w-5 h-5 text-yellow-400" />;
      case 'flow': return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case 'timing': return <Clock className="w-5 h-5 text-green-400" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500/50 bg-red-500/10 text-red-300';
      case 'warning': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300';
      case 'info': return 'border-blue-500/50 bg-blue-500/10 text-blue-300';
      default: return 'border-gray-500/50 bg-gray-500/10 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/20 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <h2 className="text-2xl font-bold text-white mb-2">{sectionConfig.title}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {sectionConfig.metrics.map((metric, index) => (
            <div key={metric} className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-sm text-gray-400">{metric}</div>
              <div className="text-lg font-bold text-white">
                {Math.floor(Math.random() * 100) + 1}
                {metric.includes('Rate') || metric.includes('Level') ? '%' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section-Specific Layout */}
      {sectionConfig.layout === 'queue' && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Queue Flow Visualization</h3>
          <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs">
                Entry
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="w-16 h-8 bg-yellow-500 rounded flex items-center justify-center text-white text-xs">
                Queue
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="w-16 h-8 bg-green-500 rounded flex items-center justify-center text-white text-xs">
                Process
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs">
                Exit
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Current: {Math.floor(Math.random() * 50) + 10} people
            </div>
          </div>
        </div>
      )}

      {/* Insights List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Active Insights ({insights.length})
        </h3>
        
        <div className="space-y-3">
          <AnimatePresence>
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-4 ${getSeverityColor(insight.severity)}`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{insight.title}</h4>
                      <span className="text-xs px-2 py-1 rounded bg-white/10 capitalize">
                        {insight.severity}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-3">{insight.description}</p>
                    
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 mb-1">Recommended Action:</p>
                      <p className="text-sm font-medium">{insight.recommendation}</p>
                    </div>
                    
                    {insight.metrics && (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                        {Object.entries(insight.metrics).map(([key, value]) => (
                          <div key={key} className="bg-white/5 rounded p-2">
                            <div className="text-xs text-gray-400 capitalize">{key}</div>
                            <div className="text-sm font-medium">{value}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        Updated: {new Date(insight.timestamp).toLocaleTimeString()}
                      </span>
                      <button className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded text-xs hover:bg-blue-500/30 transition-colors">
                        Send Alert
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {insights.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">✅</div>
              <div>No active insights for this section</div>
              <div className="text-sm mt-1">All metrics are within normal ranges</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};