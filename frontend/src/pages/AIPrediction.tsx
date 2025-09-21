import React, { useState } from 'react';
import { HeatmapMap } from '../components/HeatmapMap';
import { CrowdData } from '../types';

interface PredictionZone {
  id: string;
  area: string;
  risk: 'low' | 'medium' | 'high';
  prediction: string;
  confidence: number;
}

export const AIPrediction: React.FC = () => {
  const [timeHorizon, setTimeHorizon] = useState('15min');
  
  const predictions: PredictionZone[] = [
    { id: '1', area: 'Food Court', risk: 'high', prediction: 'Congestion expected in 12 minutes', confidence: 87 },
    { id: '2', area: 'Entrance A', risk: 'medium', prediction: 'Moderate crowding likely', confidence: 72 },
    { id: '3', area: 'Toilets', risk: 'low', prediction: 'Normal flow expected', confidence: 94 }
  ];

  const predictiveData: CrowdData[] = [];
  for (let x = 0; x < 30; x++) {
    for (let y = 0; y < 20; y++) {
      let density = Math.random() * 8;
      if (y > 10 && y < 15) density *= 2; // Food court prediction
      predictiveData.push({ x, y, density, area: `Zone ${Math.floor(x/5)}-${Math.floor(y/4)}` });
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#44ff44';
      default: return '#ccc';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
        <div>
          <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>Prediction Settings</h3>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              Time Horizon:
              <select 
                value={timeHorizon} 
                onChange={(e) => setTimeHorizon(e.target.value)}
                style={{ width: '100%', padding: '4px', marginTop: '4px' }}
              >
                <option value="5min">5 minutes</option>
                <option value="15min">15 minutes</option>
                <option value="30min">30 minutes</option>
                <option value="1hour">1 hour</option>
              </select>
            </label>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3>Prediction Alerts</h3>
            {predictions.map(pred => (
              <div key={pred.id} style={{
                padding: '12px',
                margin: '8px 0',
                borderRadius: '8px',
                border: `2px solid ${getRiskColor(pred.risk)}`,
                backgroundColor: `${getRiskColor(pred.risk)}15`
              }}>
                <div style={{ fontWeight: 'bold', color: getRiskColor(pred.risk) }}>
                  {pred.area} - {pred.risk.toUpperCase()} RISK
                </div>
                <div style={{ fontSize: '14px', margin: '4px 0' }}>{pred.prediction}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Confidence: {pred.confidence}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3>AI Predictive Heatmap ({timeHorizon})</h3>
          <HeatmapMap data={predictiveData} width={600} height={400} />
          <div style={{ marginTop: '10px', fontSize: '12px' }}>
            <span style={{ color: '#313695' }}>■ Low Risk</span>
            <span style={{ color: '#fee90d', marginLeft: '20px' }}>■ Medium Risk</span>
            <span style={{ color: '#d73027', marginLeft: '20px' }}>■ High Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
};