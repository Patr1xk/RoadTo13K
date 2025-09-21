import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QueuePoint {
  id: string;
  name: string;
  x: number; // percentage
  y: number; // percentage
  status: 'normal' | 'warning' | 'critical';
  waitTime: number;
  throughput: number;
  capacity: number;
  current: number;
}

interface SecurityQueueFlowProps {
  width?: number;
  height?: number;
}

interface FloorplanConfig {
  imageUrl: string | null;
  positions: Record<string, { x: number; y: number }>;
}

export const SecurityQueueFlowWithImage: React.FC<SecurityQueueFlowProps> = ({ 
  width = 800, 
  height = 600 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [draggedPoint, setDraggedPoint] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<QueuePoint>>({});
  const [floorplan, setFloorplan] = useState<FloorplanConfig>(() => {
    const saved = localStorage.getItem('securityFloorplan');
    return saved ? JSON.parse(saved) : { imageUrl: null, positions: {} };
  });
  const [gridSnap, setGridSnap] = useState(true);
  const [showGrid, setShowGrid] = useState(false);

  const [queuePoints, setQueuePoints] = useState<QueuePoint[]>(() => {
    const defaultPoints = [
      { id: '1', name: 'Entry Point', x: 10, y: 20, status: 'normal', waitTime: 2, throughput: 45, capacity: 50, current: 32 },
      { id: '2', name: 'Pre-Screening', x: 25, y: 35, status: 'warning', waitTime: 8, throughput: 35, capacity: 40, current: 38 },
      { id: '3', name: 'Document Check', x: 50, y: 15, status: 'normal', waitTime: 3, throughput: 60, capacity: 60, current: 28 },
      { id: '4', name: 'Baggage Scanner', x: 35, y: 60, status: 'critical', waitTime: 15, throughput: 20, capacity: 30, current: 29 },
      { id: '5', name: 'Body Scanner', x: 55, y: 65, status: 'warning', waitTime: 12, throughput: 25, capacity: 35, current: 31 },
      { id: '6', name: 'Additional Scanner', x: 75, y: 50, status: 'normal', waitTime: 5, throughput: 40, capacity: 45, current: 22 },
      { id: '7', name: 'Exit Collection', x: 80, y: 80, status: 'normal', waitTime: 1, throughput: 80, capacity: 100, current: 45 }
    ] as QueuePoint[];
    
    const saved = localStorage.getItem('securityFloorplan');
    const savedConfig = saved ? JSON.parse(saved) : { positions: {} };
    
    if (savedConfig.positions && Object.keys(savedConfig.positions).length > 0) {
      return defaultPoints.map(point => ({
        ...point,
        x: savedConfig.positions[point.id]?.x ?? point.x,
        y: savedConfig.positions[point.id]?.y ?? point.y
      }));
    }
    return defaultPoints;
  });

  const snapToGrid = useCallback((value: number, gridSize: number = 5) => {
    return Math.round(value / gridSize) * gridSize;
  }, []);

  const saveFloorplanConfig = useCallback((newConfig: FloorplanConfig) => {
    setFloorplan(newConfig);
    localStorage.setItem('securityFloorplan', JSON.stringify(newConfig));
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      const newConfig = { ...floorplan, imageUrl };
      saveFloorplanConfig(newConfig);
    };
    reader.readAsDataURL(file);
  }, [floorplan, saveFloorplanConfig]);

  const handleMouseDown = (e: React.MouseEvent, pointId: string) => {
    e.preventDefault();
    setDraggedPoint(pointId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedPoint || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;

    if (gridSnap) {
      x = snapToGrid(x);
      y = snapToGrid(y);
    }

    const newPoints = queuePoints.map(point => 
      point.id === draggedPoint 
        ? { ...point, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
        : point
    );
    
    setQueuePoints(newPoints);
    
    const positions = newPoints.reduce((acc, point) => {
      acc[point.id] = { x: point.x, y: point.y };
      return acc;
    }, {} as Record<string, { x: number; y: number }>);
    
    saveFloorplanConfig({ ...floorplan, positions });
  };

  const handleMouseUp = () => {
    setDraggedPoint(null);
  };

  const handleEdit = (point: QueuePoint) => {
    setEditForm(point);
    setSelectedPoint(null);
  };

  const handleSaveEdit = () => {
    if (editForm.id) {
      setQueuePoints(prev => prev.map(p => p.id === editForm.id ? { ...p, ...editForm } as QueuePoint : p));
      setEditForm({});
    }
  };

  const handleDelete = (pointId: string) => {
    setQueuePoints(prev => prev.filter(p => p.id !== pointId));
    setSelectedPoint(null);
  };

  const totalThroughput = queuePoints.reduce((sum, point) => sum + point.throughput, 0);
  const avgWaitTime = queuePoints.reduce((sum, point) => sum + point.waitTime, 0) / queuePoints.length;
  const criticalPoints = queuePoints.filter(point => point.status === 'critical').length;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            padding: '8px 16px',
            backgroundColor: isEditing ? '#dc3545' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isEditing ? 'Exit Edit Mode' : 'Edit Mode'}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Upload Floorplan
        </button>
        
        {floorplan.imageUrl && (
          <button
            onClick={() => saveFloorplanConfig({ imageUrl: null, positions: floorplan.positions })}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Remove Image
          </button>
        )}
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={gridSnap}
            onChange={(e) => setGridSnap(e.target.checked)}
          />
          Snap to Grid
        </label>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
          />
          Show Grid
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: floorplan.imageUrl ? 'transparent' : '#f8f9fa',
            border: '2px solid #dee2e6',
            borderRadius: '8px',
            overflow: 'hidden',
            cursor: draggedPoint ? 'grabbing' : 'default',
            backgroundImage: floorplan.imageUrl ? `url(${floorplan.imageUrl})` : 'none',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {showGrid && (
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1
              }}
            >
              <defs>
                <pattern id="grid" width="5%" height="5%" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#ddd" strokeWidth="1" opacity="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          )}

          {queuePoints.map((point) => {
            const statusColor = point.status === 'critical' ? '#dc3545' : 
                              point.status === 'warning' ? '#ffc107' : '#28a745';
            
            return (
              <motion.div
                key={point.id}
                style={{
                  position: 'absolute',
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: isEditing ? 'grab' : 'pointer',
                  zIndex: selectedPoint === point.id ? 1000 : 100
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  scale: draggedPoint === point.id ? 1.1 : 1,
                  zIndex: draggedPoint === point.id ? 1000 : 100
                }}
                onMouseDown={(e) => isEditing && handleMouseDown(e, point.id)}
                onClick={() => !isEditing && setSelectedPoint(selectedPoint === point.id ? null : point.id)}
              >
                <div
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: `3px solid ${statusColor}`,
                    borderRadius: '8px',
                    minWidth: '120px',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <div style={{ color: statusColor }}>{point.name}</div>
                  <div style={{ color: '#666', fontSize: '10px', marginTop: '2px' }}>
                    {point.current}/{point.capacity}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>System Overview</h4>
            <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
              <div>Total Throughput: <strong>{totalThroughput}/min</strong></div>
              <div>Avg Wait Time: <strong>{avgWaitTime.toFixed(1)}min</strong></div>
              <div>Critical Points: <strong style={{ color: criticalPoints > 0 ? '#dc3545' : '#28a745' }}>
                {criticalPoints}
              </strong></div>
            </div>
          </div>

          <AnimatePresence>
            {selectedPoint && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{
                  padding: '16px',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              >
                {(() => {
                  const point = queuePoints.find(p => p.id === selectedPoint);
                  if (!point) return null;
                  
                  return (
                    <>
                      <h4 style={{ margin: '0 0 12px 0' }}>{point.name}</h4>
                      <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                        <div>Status: <span style={{ 
                          color: point.status === 'critical' ? '#dc3545' : 
                                point.status === 'warning' ? '#ffc107' : '#28a745',
                          fontWeight: 'bold'
                        }}>{point.status.toUpperCase()}</span></div>
                        <div>Wait Time: {point.waitTime} min</div>
                        <div>Throughput: {point.throughput}/min</div>
                        <div>Capacity: {point.current}/{point.capacity}</div>
                        <div>Utilization: {Math.round((point.current / point.capacity) * 100)}%</div>
                      </div>
                      <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(point)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(point.id)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {editForm.id && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{
                  padding: '16px',
                  backgroundColor: 'white',
                  border: '2px solid #007bff',
                  borderRadius: '8px'
                }}
              >
                <h4 style={{ margin: '0 0 12px 0' }}>Edit Point</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Name"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <select
                    value={editForm.status || 'normal'}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                    style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="normal">Normal</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleSaveEdit}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditForm({})}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};