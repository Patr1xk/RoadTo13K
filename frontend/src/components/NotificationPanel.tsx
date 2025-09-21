import React, { useState } from 'react';

interface NotificationPanelProps {
  onSendNotification: (message: string, type: 'whatsapp' | 'sns') => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onSendNotification }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState<string | null>(null);

  const handleSend = async (type: 'whatsapp' | 'sns') => {
    setSending(type);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSendNotification(message, type);
    setMessage('');
    setSending(null);
  };

  const quickMessages = [
    'Open additional gates',
    'Deploy crowd control staff',
    'Redirect to alternate route',
    'Prepare for emergency evacuation'
  ];

  return (
    <div className="card">
      <h3 style={{ margin: '0 0 16px 0', color: '#2c3e50' }}>Send Notifications</h3>
      
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>Quick Messages:</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {quickMessages.map(msg => (
            <button
              key={msg}
              onClick={() => setMessage(msg)}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              {msg}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter crowd management instruction..."
        style={{ 
          width: '100%', 
          height: '80px', 
          padding: '8px', 
          marginBottom: '12px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          resize: 'vertical',
          fontSize: '14px'
        }}
      />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => handleSend('whatsapp')}
          disabled={!message.trim() || sending !== null}
          className="btn btn-success"
          style={{
            backgroundColor: '#25d366',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          {sending === 'whatsapp' ? '📤 Sending...' : '📱 WhatsApp'}
        </button>
        <button
          onClick={() => handleSend('sns')}
          disabled={!message.trim() || sending !== null}
          className="btn"
          style={{
            backgroundColor: '#ff9900',
            color: 'white',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          {sending === 'sns' ? '📤 Sending...' : '📧 SNS'}
        </button>
      </div>
    </div>
  );
};