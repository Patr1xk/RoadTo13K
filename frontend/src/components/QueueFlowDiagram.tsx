import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QueueStation } from './QueueStation';
import { FlowArrow } from './FlowArrow';
import { QueueStationData } from '../types';

interface QueueFlowDiagramProps {
  isLive?: boolean;
  onStatsUpdate?: (stations: QueueStationData[]) => void;
}

const mockStations: QueueStationData[] = [
  { id: 'entry', name: 'Entry Point', x: 60, y: 80, type: 'entry', occupancy: 12, capacity: 20, waitTime: 2, queueLength: 8, status: 'normal' },
  { id: 'prescreening', name: 'Pre-Screening', x: 220, y: 80, type: 'checkpoint', occupancy: 18, capacity: 25, waitTime: 4, queueLength: 15, status: 'busy' },
  { id: 'document', name: 'Document Check', x: 380, y: 80, type: 'checkpoint', occupancy: 22, capacity: 30, waitTime: 6, queueLength: 22, status: 'congested' },
  { id: 'scanner', name: 'Body Scanner', x: 540, y: 80, type: 'scanner', occupancy: 8, capacity: 12, waitTime: 3, queueLength: 6, status: 'normal' },
  { id: 'bagcheck', name: 'Bag Check', x: 380, y: 240, type: 'checkpoint', occupancy: 15, capacity: 20, waitTime: 5, queueLength: 12, status: 'busy' },
  { id: 'pickup', name: 'Bag Pickup', x: 540, y: 240, type: 'pickup', occupancy: 10, capacity: 15, waitTime: 2, queueLength: 5, status: 'normal' },
  { id: 'exit', name: 'Exit Gate', x: 700, y: 160, type: 'exit', occupancy: 5, capacity: 10, waitTime: 1, queueLength: 3, status: 'normal' }
];

const flowConnections = [
  { from: 'entry', to: 'prescreening' },
  { from: 'prescreening', to: 'document' },
  { from: 'document', to: 'scanner' },
  { from: 'document', to: 'bagcheck' },
  { from: 'scanner', to: 'exit' },
  { from: 'bagcheck', to: 'pickup' },
  { from: 'pickup', to: 'exit' }
];

export const QueueFlowDiagram: React.FC<QueueFlowDiagramProps> = ({
  isLive = false,
  onStatsUpdate
}) => {
  const [stations, setStations] = useState<QueueStationData[]>(mockStations);

  const generateLiveData = () => {
    return stations.map(station => {
      // Gradual occupancy changes (±1 or ±2)
      const change = Math.random() > 0.5 ? 
        (Math.random() > 0.7 ? 2 : 1) : 
        (Math.random() > 0.7 ? -2 : -1);
      
      const newOccupancy = Math.max(0, Math.min(station.capacity, station.occupancy + change));
      const utilizationRate = newOccupancy / station.capacity;
      
      // Smooth status transitions based on capacity thresholds
      let status: 'normal' | 'busy' | 'congested';
      if (newOccupancy >= station.capacity) {
        status = 'congested'; // Red only at max capacity
      } else if (newOccupancy > station.capacity * 0.35) {
        status = 'busy'; // Yellow for medium usage
      } else {
        status = 'normal'; // Green for low usage
      }

      return {
        ...station,
        occupancy: newOccupancy,
        waitTime: Math.max(1, Math.round(utilizationRate * 6 + 1)),
        queueLength: Math.round(utilizationRate * 20 + Math.random() * 3),
        status
      };
    });
  };

  useEffect(() => {
    if (isLive) {
      const updateQueue = () => {
        const updatedStations = generateLiveData();
        setStations(updatedStations);
        onStatsUpdate?.(updatedStations);
        
        // Schedule next update with 5-7 second random interval
        const nextInterval = 5000 + Math.random() * 2000;
        setTimeout(updateQueue, nextInterval);
      };
      
      // Start first update
      const initialTimeout = setTimeout(updateQueue, 5000);
      
      return () => clearTimeout(initialTimeout);
    }
  }, [isLive, onStatsUpdate]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Security Queue Flow</h3>
        {isLive && (
          <div className="flex items-center gap-2 text-green-400">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">LIVE FLOW</span>
          </div>
        )}
      </div>

      <div className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-lg p-4 h-[500px] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, #3b82f6 2px, transparent 2px), radial-gradient(circle at 75% 75%, #8b5cf6 2px, transparent 2px)',
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        {/* Flow Arrows */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {flowConnections.map(connection => {
            const fromStation = stations.find(s => s.id === connection.from);
            const toStation = stations.find(s => s.id === connection.to);
            if (!fromStation || !toStation) return null;

            return (
              <FlowArrow
                key={`${connection.from}-${connection.to}`}
                from={{ x: fromStation.x + 60, y: fromStation.y + 30 }}
                to={{ x: toStation.x, y: toStation.y + 30 }}
                intensity={fromStation.status === 'congested' ? 'high' : fromStation.status === 'busy' ? 'medium' : 'low'}
              />
            );
          })}
        </svg>

        {/* Queue Stations */}
        {stations.map(station => (
          <QueueStation
            key={station.id}
            station={station}
            style={{ zIndex: 2 }}
          />
        ))}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500/30 border-2 border-green-500 rounded"></div>
            <span className="text-gray-300">Normal Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500/30 border-2 border-yellow-500 rounded"></div>
            <span className="text-gray-300">Busy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500/40 border-2 border-red-500 rounded animate-pulse"></div>
            <span className="text-gray-300">Congested</span>
          </div>
        </div>

        {/* Flow Direction Indicator */}
        <div className="absolute top-4 right-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <span>Flow Direction</span>
            <svg width="20" height="12" viewBox="0 0 20 12" className="text-blue-400">
              <path d="M1 6h16m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
};