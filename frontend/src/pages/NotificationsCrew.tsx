import React, { useState } from 'react';
import { NotificationPanel } from '../components/NotificationPanel';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { AIRecommendation } from '../types';

interface CrewMessage {
  id: string;
  message: string;
  type: 'sent' | 'received';
  timestamp: Date;
  crew?: string;
}

export const NotificationsCrew: React.FC = () => {
  const [messages, setMessages] = useState<CrewMessage[]>([
    { id: '1', message: 'Open Gate C for crowd dispersal', type: 'sent', timestamp: new Date(Date.now() - 300000) },
    { id: '2', message: 'Gate C opened, crowd flow improved', type: 'received', timestamp: new Date(Date.now() - 240000), crew: 'Team Alpha' }
  ]);

  const [recommendations] = useState<AIRecommendation[]>([
    { id: '1', message: 'Deploy additional staff to Food Court area', priority: 'high' },
    { id: '2', message: 'Redirect crowd flow through Entrance B', priority: 'medium' }
  ]);

  const handleSendNotification = (message: string, type: 'whatsapp' | 'sns') => {
    const newMessage: CrewMessage = {
      id: Date.now().toString(),
      message,
      type: 'sent',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleApprove = (id: string) => {
    console.log('Approved recommendation:', id);
  };

  const handleDeny = (id: string) => {
    console.log('Denied recommendation:', id);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h2>Send Notifications</h2>
          <NotificationPanel onSendNotification={handleSendNotification} />
          
          <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h3>Activity Feed</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{
                  padding: '12px',
                  margin: '8px 0',
                  backgroundColor: msg.type === 'sent' ? '#e3f2fd' : '#f3e5f5',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${msg.type === 'sent' ? '#2196f3' : '#9c27b0'}`
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {msg.type === 'sent' ? '📤 Sent' : '📥 Received'}
                    {msg.crew && ` from ${msg.crew}`}
                  </div>
                  <div style={{ margin: '4px 0' }}>{msg.message}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2>Crew Feedback</h2>
          <FeedbackPanel
            recommendations={recommendations}
            onApprove={handleApprove}
            onDeny={handleDeny}
          />
        </div>
      </div>
    </div>
  );
};