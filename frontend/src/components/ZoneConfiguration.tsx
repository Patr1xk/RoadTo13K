import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Square, Wand2, Save, ArrowLeft } from 'lucide-react';
import { FloorPlan, Zone } from '../types';

interface ZoneConfigurationProps {
  floorPlan: FloorPlan;
  onZonesConfigured: (zones: Zone[]) => void;
  onBack: () => void;
}

const zoneTypes = [
  { type: 'entrance', label: 'Entrance', color: '#10b981' },
  { type: 'exit', label: 'Exit', color: '#ef4444' },
  { type: 'seating', label: 'Seating', color: '#3b82f6' },
  { type: 'concourse', label: 'Concourse', color: '#8b5cf6' },
  { type: 'facility', label: 'Facility', color: '#f59e0b' }
];

export const ZoneConfiguration: React.FC<ZoneConfigurationProps> = ({
  floorPlan,
  onZonesConfigured,
  onBack
}) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZoneType, setSelectedZoneType] = useState<Zone['type']>('entrance');
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setDragStart({ x, y });
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !dragStart || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const width = Math.abs(x - dragStart.x);
    const height = Math.abs(y - dragStart.y);
    
    if (width > 20 && height > 20) {
      const newZone: Zone = {
        id: `zone_${Date.now()}`,
        name: `${selectedZoneType} ${zones.length + 1}`,
        x: Math.min(x, dragStart.x),
        y: Math.min(y, dragStart.y),
        width,
        height,
        type: selectedZoneType,
        color: zoneTypes.find(t => t.type === selectedZoneType)?.color || '#3b82f6'
      };
      
      setZones(prev => [...prev, newZone]);
    }
    
    setIsDrawing(false);
    setDragStart(null);
  }, [isDrawing, dragStart, selectedZoneType, zones.length]);

  const autoDetectZones = () => {
    const autoZones: Zone[] = [
      { id: 'auto_1', name: 'Main Entrance', x: 50, y: 300, width: 100, height: 80, type: 'entrance', color: '#10b981' },
      { id: 'auto_2', name: 'Seating Area', x: 200, y: 100, width: 400, height: 200, type: 'seating', color: '#3b82f6' },
      { id: 'auto_3', name: 'Concourse', x: 150, y: 320, width: 500, height: 100, type: 'concourse', color: '#8b5cf6' },
      { id: 'auto_4', name: 'Emergency Exit', x: 650, y: 50, width: 80, height: 60, type: 'exit', color: '#ef4444' }
    ];
    setZones(autoZones);
  };

  const deleteZone = (zoneId: string) => {
    setZones(prev => prev.filter(z => z.id !== zoneId));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="btn-modern bg-gray-700 hover:bg-gray-600">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Configure Zones</h1>
            <p className="text-gray-400">Draw areas to monitor crowd traffic</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={autoDetectZones} className="btn-modern bg-purple-600 hover:bg-purple-700">
            <Wand2 className="w-4 h-4 mr-2" />
            Auto Detect
          </button>
          <button 
            onClick={() => onZonesConfigured(zones)}
            disabled={zones.length === 0}
            className="btn-primary"
          >
            <Save className="w-4 h-4 mr-2" />
            Continue ({zones.length} zones)
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Zone Tools */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Zone Types</h3>
          <div className="space-y-2">
            {zoneTypes.map(type => (
              <button
                key={type.type}
                onClick={() => setSelectedZoneType(type.type as Zone['type'])}
                className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                  selectedZoneType === type.type
                    ? 'bg-white/20 border-2 border-white/30'
                    : 'bg-white/5 hover:bg-white/10 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="text-white font-medium">{type.label}</span>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-6 p-3 bg-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-200">
              <Square className="w-4 h-4 inline mr-1" />
              Click and drag to create zones
            </p>
          </div>
        </motion.div>

        {/* Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Floor Plan</h3>
          <div
            ref={canvasRef}
            className="relative bg-gray-900 rounded-lg overflow-hidden cursor-crosshair"
            style={{ width: '100%', height: '400px' }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            {/* Floorplan background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-50" />
            
            {/* Zones */}
            {zones.map(zone => (
              <div
                key={zone.id}
                className="absolute border-2 rounded cursor-pointer group"
                style={{
                  left: zone.x,
                  top: zone.y,
                  width: zone.width,
                  height: zone.height,
                  borderColor: zone.color,
                  backgroundColor: `${zone.color}20`
                }}
                onClick={() => deleteZone(zone.id)}
              >
                <div className="absolute -top-6 left-0 bg-gray-800 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {zone.name}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Zone List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Zones ({zones.length})</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {zones.map(zone => (
              <div
                key={zone.id}
                className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: zone.color }}
                    />
                    <span className="text-white text-sm font-medium">{zone.name}</span>
                  </div>
                  <button
                    onClick={() => deleteZone(zone.id)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    ×
                  </button>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {Math.round(zone.width)}×{Math.round(zone.height)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};