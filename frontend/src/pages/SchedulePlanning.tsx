import React, { useState } from 'react';

interface ScheduleEvent {
  id: string;
  name: string;
  time: string;
  type: 'event' | 'transport';
  status: 'scheduled' | 'active' | 'completed';
}

export const SchedulePlanning: React.FC = () => {
  const [events] = useState<ScheduleEvent[]>([
    { id: '1', name: 'Event Start', time: '19:00', type: 'event', status: 'completed' },
    { id: '2', name: 'Half-Time', time: '20:00', type: 'event', status: 'active' },
    { id: '3', name: 'Event End', time: '21:30', type: 'event', status: 'scheduled' },
    { id: '4', name: 'Bus Service A', time: '21:45', type: 'transport', status: 'scheduled' },
    { id: '5', name: 'LRT Last Train', time: '23:30', type: 'transport', status: 'scheduled' }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'active': return '#ffc107';
      case 'scheduled': return '#6c757d';
      default: return '#ccc';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h2>Event Timeline</h2>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
            {events.map(event => (
              <div key={event.id} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                margin: '8px 0',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa',
                borderLeft: `4px solid ${getStatusColor(event.status)}`
              }}>
                <div style={{ marginRight: '16px', fontWeight: 'bold', minWidth: '60px' }}>
                  {event.time}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>{event.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {event.type === 'event' ? '🎪 Event' : '🚌 Transport'}
                  </div>
                </div>
                <div style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  backgroundColor: getStatusColor(event.status),
                  color: 'white'
                }}>
                  {event.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2>Transport Optimization</h2>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <div style={{ marginBottom: '20px' }}>
              <h4>Crowd Flow Prediction</h4>
              <div style={{ padding: '12px', backgroundColor: '#e8f5e8', borderRadius: '8px', marginBottom: '12px' }}>
                <strong>✅ Optimal Window:</strong> 21:30 - 22:15<br />
                <small>85% of crowd can exit via available transport</small>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
                <strong>⚠️ Risk Period:</strong> 22:15 - 23:00<br />
                <small>Potential bottleneck if event runs late</small>
              </div>
            </div>

            <div>
              <h4>Recommendations</h4>
              <ul style={{ paddingLeft: '20px' }}>
                <li>Deploy extra buses at 21:45</li>
                <li>Open all exit gates by 21:30</li>
                <li>Announce transport schedules at half-time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};