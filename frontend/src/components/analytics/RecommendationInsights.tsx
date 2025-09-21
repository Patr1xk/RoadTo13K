import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, TrendingUp, Users, Send, Clock } from 'lucide-react';
import { RecommendationInsight } from '../../types';

interface RecommendationInsightsProps {
  insights: RecommendationInsight[];
  onSendNotification: (insight: RecommendationInsight) => void;
  highlightedId?: string | null;
}

export const RecommendationInsights: React.FC<RecommendationInsightsProps> = ({
  insights,
  onSendNotification,
  highlightedId
}) => {
  const getSeverityConfig = (severity: RecommendationInsight['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          iconColor: 'text-red-400'
        };
      case 'warning':
        return {
          icon: <TrendingUp className="w-5 h-5" />,
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400',
          iconColor: 'text-yellow-400'
        };
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-400',
          iconColor: 'text-blue-400'
        };
    }
  };

  const getTypeIcon = (type: RecommendationInsight['type']) => {
    switch (type) {
      case 'traffic': return <TrendingUp className="w-4 h-4" />;
      case 'occupancy': return <Users className="w-4 h-4" />;
      case 'bottleneck': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  if (insights.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Info className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Recommendation Insights</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-2 opacity-50">✨</div>
          <p className="text-gray-400">No active recommendations</p>
          <p className="text-sm text-gray-500 mt-1">All zones operating normally</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-bold text-white">Recommendation Insights</h3>
        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
          {insights.length} active
        </span>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {insights.map((insight, index) => {
            const config = getSeverityConfig(insight.severity);
            
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor} ${
                  highlightedId === insight.id ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={config.iconColor}>
                    {config.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-white">{insight.title}</h4>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        {getTypeIcon(insight.type)}
                        <span className="capitalize">{insight.type}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(insight.timestamp)}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3">{insight.message}</p>
                    
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 mb-1">Suggested Action:</p>
                      <p className="text-sm text-white">{insight.suggestedAction}</p>
                    </div>
                    
                    {insight.affectedZones.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-400 mb-1">Affected Zones:</p>
                        <div className="flex flex-wrap gap-1">
                          {insight.affectedZones.map(zone => (
                            <span
                              key={zone}
                              className="px-2 py-1 bg-white/10 text-xs text-gray-300 rounded"
                            >
                              {zone}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {insight.actionable && (
                      <div className="flex items-center justify-end">
                        <motion.button
                          onClick={() => onSendNotification(insight)}
                          className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Send className="w-4 h-4" />
                          Send Notification
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};