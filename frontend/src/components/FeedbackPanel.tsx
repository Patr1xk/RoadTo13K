import React from 'react';
import { AIRecommendation } from '../types';

interface FeedbackPanelProps {
  recommendations: AIRecommendation[];
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  recommendations,
  onApprove,
  onDeny
}) => {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#44aa44';
      default: return '#ccc';
    }
  };

  return (
    <div className="card">
      <h3 style={{ margin: '0 0 16px 0', color: '#2c3e50' }}>AI Recommendations</h3>
      {recommendations.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          🤖 No recommendations at this time
        </div>
      ) : (
        recommendations.map(rec => (
          <div key={rec.id} style={{ 
            marginBottom: '12px', 
            padding: '16px', 
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: `2px solid ${getPriorityColor(rec.priority)}20`,
            borderLeft: `4px solid ${getPriorityColor(rec.priority)}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ marginRight: '8px', fontSize: '16px' }}>{getPriorityIcon(rec.priority)}</span>
              <span style={{ 
                fontSize: '10px', 
                fontWeight: 'bold', 
                color: getPriorityColor(rec.priority),
                textTransform: 'uppercase',
                backgroundColor: `${getPriorityColor(rec.priority)}20`,
                padding: '2px 6px',
                borderRadius: '8px'
              }}>
                {rec.priority} Priority
              </span>
            </div>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.4' }}>{rec.message}</p>
            {rec.approved === undefined && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => onApprove(rec.id)}
                  className="btn btn-success"
                  style={{ flex: 1, fontSize: '12px' }}
                >
                  ✓ Approve
                </button>
                <button 
                  onClick={() => onDeny(rec.id)}
                  className="btn btn-danger"
                  style={{ flex: 1, fontSize: '12px' }}
                >
                  ✗ Deny
                </button>
              </div>
            )}
            {rec.approved !== undefined && (
              <div style={{
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: rec.approved ? '#d4edda' : '#f8d7da',
                color: rec.approved ? '#155724' : '#721c24',
                fontSize: '12px',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                {rec.approved ? '✓ APPROVED' : '✗ DENIED'}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};