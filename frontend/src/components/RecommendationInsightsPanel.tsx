import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Pause, Play, AlertTriangle, TrendingUp, Users, X } from 'lucide-react';
import { RecommendationInsight } from '../types';
import { useInsights } from '../contexts/InsightsContext';

interface RecommendationInsightsPanelProps {
  insights: RecommendationInsight[];
  newInsightIds?: Set<string>;
  className?: string;
  onPauseChange?: (isPaused: boolean) => void;
}

export const RecommendationInsightsPanel: React.FC<RecommendationInsightsPanelProps> = ({
  insights: propInsights,
  newInsightIds = new Set(),
  className = '',
  onPauseChange
}) => {
  const navigate = useNavigate();
  const { removeInsight } = useInsights();
  const insights = propInsights; // Use prop insights for now
  const [isPaused, setIsPaused] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleInteractionStart = () => {
    setIsInteracting(true);
    setIsPaused(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onPauseChange?.(true);
  };

  const handleInteractionEnd = () => {
    setIsInteracting(false);
    timeoutRef.current = setTimeout(() => {
      setIsPaused(false);
      onPauseChange?.(false);
    }, 10000); // 10 second timeout
  };

  const togglePause = () => {
    const newPaused = !isPaused;
    setIsPaused(newPaused);
    onPauseChange?.(newPaused);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'traffic': return '🚶';
      case 'occupancy': return '👥';
      case 'bottleneck': return '⚠️';
      case 'safety': return '🚨';
      default: return 'ℹ️';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500/50 bg-red-500/10';
      case 'warning': return 'border-yellow-500/50 bg-yellow-500/10';
      default: return 'border-blue-500/50 bg-blue-500/10';
    }
  };

  const handleSendNotification = (insight: RecommendationInsight) => {
    navigate('/notifications', {
      state: {
        prefilledRecommendation: insight
      }
    });
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 ${className}`}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onFocus={handleInteractionStart}
      onBlur={handleInteractionEnd}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">Insights</h3>
          {isPaused && (
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded">
              <Pause className="w-3 h-3" />
              <span>Live Paused</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-400">{insights.length} active</div>
          <button
            onClick={togglePause}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title={isPaused ? 'Resume updates' : 'Pause updates'}
          >
            {isPaused ? (
              <Play className="w-4 h-4 text-green-400" />
            ) : (
              <Pause className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
        <AnimatePresence>
          {insights.map((insight, index) => {
            const isNew = newInsightIds.has(insight.id);
            
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  scale: 1
                }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`border rounded-lg p-3 ${getSeverityColor(insight.severity)} ${
                  isNew ? 'ring-2 ring-blue-400 ring-opacity-50 shadow-lg shadow-blue-500/20' : ''
                }`}
              >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2 flex-1">
                <span className="text-lg">{getTypeIcon(insight.type)}</span>
                <h4 className="font-medium text-white text-sm">{insight.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  insight.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                  insight.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {insight.severity}
                </span>
                <button
                  onClick={() => removeInsight(insight.id)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Dismiss insight"
                >
                  <X className="w-3 h-3 text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-300 mb-2">{insight.message}</p>
            
            <div className="text-xs text-gray-400 mb-3">
              <strong>Action:</strong> {insight.suggestedAction}
            </div>

            {insight.affectedZones.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {insight.affectedZones.slice(0, 2).map(zone => (
                  <span key={zone} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded">
                    {zone}
                  </span>
                ))}
                {insight.affectedZones.length > 2 && (
                  <span className="text-xs text-gray-400">+{insight.affectedZones.length - 2} more</span>
                )}
              </div>
            )}

            {insight.actionable && (
              <button
                onClick={() => handleSendNotification(insight)}
                className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs py-2 px-3 rounded transition-colors"
              >
                Send Notification
              </button>
            )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {insights.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-sm">No active insights</div>
          </div>
        )}
      </div>
    </motion.div>
  );
};