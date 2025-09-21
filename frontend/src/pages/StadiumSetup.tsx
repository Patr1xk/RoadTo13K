import React, { useState } from 'react';

interface FloorPlanArea {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'entrance' | 'exit' | 'facility' | 'seating';
}

export const StadiumSetup: React.FC = () => {
  const [areas, setAreas] = useState<FloorPlanArea[]>([
    { id: '1', name: 'Main Entrance', x: 50, y: 350, type: 'entrance' },
    { id: '2', name: 'Food Court', x: 200, y: 200, type: 'facility' },
    { id: '3', name: 'Emergency Exit', x: 500, y: 50, type: 'exit' }
  ]);
  
  const [trainingMode, setTrainingMode] = useState(false);
  const [selectedAreaType, setSelectedAreaType] = useState<FloorPlanArea['type']>('entrance');

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newArea: FloorPlanArea = {
      id: Date.now().toString(),
      name: `New ${selectedAreaType}`,
      x,
      y,
      type: selectedAreaType
    };
    
    setAreas(prev => [...prev, newArea]);
  };

  const getAreaColor = (type: FloorPlanArea['type']) => {
    switch (type) {
      case 'entrance': return '#4CAF50';
      case 'exit': return '#f44336';
      case 'facility': return '#2196F3';
      case 'seating': return '#FF9800';
      default: return '#ccc';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
        <div>
          <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>Floor Plan Tools</h3>
            <label style={{ display: 'block', marginBottom: '12px' }}>
              Area Type:
              <select 
                value={selectedAreaType}
                onChange={(e) => setSelectedAreaType(e.target.value as FloorPlanArea['type'])}
                style={{ width: '100%', padding: '4px', marginTop: '4px' }}
              >
                <option value="entrance">Entrance</option>
                <option value="exit">Exit</option>
                <option value="facility">Facility</option>
                <option value="seating">Seating</option>
              </select>
            </label>
            <p style={{ fontSize: '12px', color: '#666' }}>
              Click on the floor plan to add areas
            </p>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3>Training Mode</h3>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <input
                type="checkbox"
                checked={trainingMode}
                onChange={(e) => setTrainingMode(e.target.checked)}
              />
              <span style={{ marginLeft: '8px' }}>Enable AI Training</span>
            </label>
            {trainingMode && (
              <div style={{ padding: '12px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  🤖 Training mode active. Simulating crowd patterns for AI learning.
                </p>
              </div>
            )}
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3>Stadium Floor Plan</h3>
          <div 
            onClick={handleCanvasClick}
            style={{
              width: '600px',
              height: '400px',
              border: '2px dashed #ccc',
              position: 'relative',
              backgroundColor: '#f9f9f9',
              cursor: 'crosshair'
            }}
          >
            {areas.map(area => (
              <div
                key={area.id}
                style={{
                  position: 'absolute',
                  left: area.x - 15,
                  top: area.y - 15,
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: getAreaColor(area.type),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
                title={area.name}
              >
                {area.type === 'entrance' ? '🚪' : 
                 area.type === 'exit' ? '🚨' :
                 area.type === 'facility' ? '🏢' : '💺'}
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '12px' }}>
            <span><span style={{ color: '#4CAF50' }}>●</span> Entrance</span>
            <span><span style={{ color: '#f44336' }}>●</span> Exit</span>
            <span><span style={{ color: '#2196F3' }}>●</span> Facility</span>
            <span><span style={{ color: '#FF9800' }}>●</span> Seating</span>
          </div>
        </div>
      </div>
    </div>
  );
};