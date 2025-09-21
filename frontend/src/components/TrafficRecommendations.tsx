import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Users, MessageSquare, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import { TrafficRecommendation, NotificationPayload } from '../types';

interface TrafficRecommendationsProps {
  recommendations: TrafficRecommendation[];
  onNotifyCrew: (payload: NotificationPayload) => void;
  onDismissRecommendation: (recommendationId: string) => void;
  className?: string;
}

export const TrafficRecommendations: React.FC<TrafficRecommendationsProps> = ({
  recommendations,
  onNotifyCrew,
  onDismissRecommendation,
  className = ''
}) => {
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);
  const [sendingNotification, setSendingNotification] = useState<string | null>(null);

  const getSeverityColor = (severity: TrafficRecommendation['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500';
    }
  };

  const getSeverityIcon = (severity: TrafficRecommendation['severity']) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'medium': return <Users className="w-5 h-5" />;
      case 'low': return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: TrafficRecommendation['status']) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'acknowledged': return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'sent': return <Send className="w-4 h-4 text-yellow-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleNotifyCrew = async (recommendation: TrafficRecommendation) => {
    setSendingNotification(recommendation.id);
    
    const payload: NotificationPayload = {
      recipientType: 'crew',
      recipients: ['crew-team-1', 'security-team'], // Mock recipients
      subject: `Traffic Alert: ${recommendation.zoneName}`,
      message: `${recommendation.message}\n\nRecommended Action: ${recommendation.actionRequired}`,
      priority: recommendation.severity === 'critical' ? 'urgent' : 
                recommendation.severity === 'high' ? 'high' : 'medium',
      zoneId: recommendation.zoneId,
      recommendationId: recommendation.id
    };

    try {
      await onNotifyCrew(payload);
      // Simulate notification delay
      setTimeout(() => {
        setSendingNotification(null);
      }, 1500);
    } catch (error) {
      console.error('Failed to send notification:', error);
      setSendingNotification(null);
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return timestamp.toLocaleDateString();
  };

  if (!recommendations.length) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-3 ${className}`}
    >
      <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-yellow-400" />
        Traffic Recommendations ({recommendations.length})
      </h4>

      <AnimatePresence>
        {recommendations.map((recommendation, index) => (
          <motion.div
            key={recommendation.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-card p-4 border-l-4 ${getSeverityColor(recommendation.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  {getSeverityIcon(recommendation.severity)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-semibold text-white">{recommendation.zoneName}</h5>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(recommendation.severity)}`}>
                      {recommendation.severity.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(recommendation.status)}
                      <span className="text-xs text-gray-400 capitalize">{recommendation.status}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-2">{recommendation.message}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {formatTimeAgo(recommendation.timestamp)}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {recommendation.status === 'pending' && (
                        <motion.button
                          onClick={() => handleNotifyCrew(recommendation)}
                          disabled={sendingNotification === recommendation.id}
                          className="btn-primary text-xs px-3 py-1 flex items-center gap-1"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {sendingNotification === recommendation.id ? (
                            <>
                              <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3" />
                              Notify Crew
                            </>
                          )}
                        </motion.button>
                      )}
                      
                      <button
                        onClick={() => setExpandedRecommendation(
                          expandedRecommendation === recommendation.id ? null : recommendation.id
                        )}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {expandedRecommendation === recommendation.id ? 'Less' : 'Details'}
                      </button>
                      
                      <button
                        onClick={() => onDismissRecommendation(recommendation.id)}
                        className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded details */}
            <AnimatePresence>
              {expandedRecommendation === recommendation.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-white/10"
                >
                  <div className="space-y-3">
                    <div>
                      <h6 className="text-sm font-semibold text-white mb-1">Recommended Action:</h6>
                      <p className="text-sm text-gray-300">{recommendation.actionRequired}</p>
                    </div>
                    
                    <div>
                      <h6 className="text-sm font-semibold text-white mb-1">Alert Type:</h6>
                      <span className="text-sm text-gray-300 capitalize">{recommendation.type.replace('-', ' ')}</span>
                    </div>

                    {recommendation.crewFeedback && (
                      <div>
                        <h6 className="text-sm font-semibold text-white mb-1">Crew Feedback:</h6>
                        <div className="bg-white/5 rounded p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-blue-300">{recommendation.crewFeedback.crewName}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              recommendation.crewFeedback.response === 'accepted' ? 'bg-green-500/20 text-green-300' :
                              recommendation.crewFeedback.response === 'rejected' ? 'bg-red-500/20 text-red-300' :
                              'bg-yellow-500/20 text-yellow-300'
                            }`}>
                              {recommendation.crewFeedback.response}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{recommendation.crewFeedback.message}</p>
                          {recommendation.crewFeedback.actionTaken && (
                            <p className="text-xs text-gray-400 mt-2">Action: {recommendation.crewFeedback.actionTaken}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};