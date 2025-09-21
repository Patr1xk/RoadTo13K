import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, TrendingUp, Users, Clock, Send } from 'lucide-react';
import { useVenue } from '../../contexts/VenueContext';
import { useVenueInsights } from '../../hooks/useVenueInsights';

export const EnhancedInsightsPanel: React.FC = () => {
  const navigate = useNavigate();
  const { selectedVenue, selectedZone, getCurrentVenue, getCurrentZone } = useVenue();
  const { insights, loading } = useVenueInsights(selectedVenue, selectedZone);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  const currentVenue = getCurrentVenue();
  const currentZone = getCurrentZone();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'traffic': return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case 'occupancy': return <Users className="w-5 h-5 text-yellow-400" />;
      case 'bottleneck': return <AlertTriangle className="w-5 h-5 text-red-400" />;
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

  const handleSendNotification = (insight: any) => {
    navigate('/notification-management', {
      state: {
        activeTab: 'dispatch',
        prefilledMessage: `${insight.title}: ${insight.message}. Recommended action: ${insight.suggestedAction}`,
        targetVenue: currentVenue?.name,
        targetZone: currentZone?.name
      }
    });
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/20 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Recommendation Insights</h3>
          {currentVenue && currentZone && (
            <p className="text-sm text-gray-400">
              {currentVenue.name} • {currentZone.name}
            </p>
          )}
        </div>
        <div className="text-xs text-gray-400">{insights.length} active</div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${getSeverityColor(insight.severity)}`}
              onClick={() => setExpandedInsight(expandedInsight === insight.id ? null : insight.id)}
            >
              <div className="flex items-start gap-3">
                {getTypeIcon(insight.type)}
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white text-sm">{insight.title}</h4>
                    <span className="text-xs px-2 py-1 rounded bg-white/10 capitalize">
                      {insight.severity}
                    </span>
                  </div>
                  
                  <p className="text-sm mb-2">{insight.message}</p>
                  
                  <AnimatePresence>
                    {expandedInsight === insight.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 mt-3 pt-3 border-t border-white/20"
                      >
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Recommended Action:</p>
                          <p className="text-sm font-medium">{insight.suggestedAction}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {new Date(insight.timestamp).toLocaleTimeString()}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendNotification(insight);
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded text-xs hover:bg-blue-500/30 transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            Send Notification
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {insights.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">✅</div>
            <div>No active insights for this zone</div>
            <div className="text-sm mt-1">All metrics are within normal ranges</div>
          </div>
        )}
      </div>
    </div>
  );
};