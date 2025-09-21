import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Users, 
  Shield, 
  Package, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  Move,
  Eye
} from 'lucide-react';

interface QueuePoint {
  id: string;
  label: string;
  x: number; // Percentage of image width
  y: number; // Percentage of image height
  type: 'entry' | 'check' | 'scan' | 'exit' | 'queue';
  stats: {
    waitTime: number;
    throughput: number;
    capacity: number;
    current: number;
  };
  status: 'normal' | 'warning' | 'critical';
}

interface SecurityQueueFlowProps {
  imageUrl?: string;
  className?: string;
}

const defaultPoints: QueuePoint[] = [
  {
    id: '1',
    label: 'Entry Point',
    x: 15,
    y: 25,
    type: 'entry',
    stats: { waitTime: 2.5, throughput: 45, capacity: 100, current: 23 },
    status: 'normal'
  },
  {
    id: '2',
    label: 'Document Check',
    x: 35,
    y: 40,
    type: 'check',
    stats: { waitTime: 4.2, throughput: 35, capacity: 80, current: 67 },
    status: 'warning'
  },
  {
    id: '3',
    label: 'Security Scan',
    x: 55,
    y: 35,
    type: 'scan',
    stats: { waitTime: 6.8, throughput: 25, capacity: 60, current: 58 },
    status: 'critical'
  },
  {
    id: '4',
    label: 'Bag Pickup',
    x: 75,
    y: 50,
    type: 'scan',
    stats: { waitTime: 1.8, throughput: 40, capacity: 70, current: 12 },
    status: 'normal'
  },
  {
    id: '5',
    label: 'Exit Gate',
    x: 85,
    y: 25,
    type: 'exit',
    stats: { waitTime: 0.5, throughput: 60, capacity: 120, current: 8 },
    status: 'normal'
  }
];

export const SecurityQueueFlow: React.FC<SecurityQueueFlowProps> = ({
  imageUrl: initialImageUrl = '/api/placeholder/800/600',
  className = ''
}) => {
  const [points, setPoints] = useState<QueuePoint[]>(defaultPoints);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [draggedPoint, setDraggedPoint] = useState<string | null>(null);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 800, height: 600 });
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update image size on load and resize
  const updateImageSize = useCallback(() => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      setImageSize({ width: rect.width, height: rect.height });
    }
  }, []);

  useEffect(() => {
    const handleResize = () => updateImageSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateImageSize]);

  const getPointIcon = (type: string) => {
    switch (type) {
      case 'entry': return <MapPin className="w-4 h-4" />;
      case 'check': return <Shield className="w-4 h-4" />;
      case 'scan': return <Eye className="w-4 h-4" />;
      case 'exit': return <Package className="w-4 h-4" />;
      case 'queue': return <Users className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500 border-green-400';
      case 'warning': return 'bg-yellow-500 border-yellow-400';
      case 'critical': return 'bg-red-500 border-red-400';
      default: return 'bg-gray-500 border-gray-400';
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (!isAddingPoint || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPoint: QueuePoint = {
      id: Date.now().toString(),
      label: `Point ${points.length + 1}`,
      x,
      y,
      type: 'queue',
      stats: { waitTime: 0, throughput: 0, capacity: 50, current: 0 },
      status: 'normal'
    };

    setPoints(prev => [...prev, newPoint]);
    setIsAddingPoint(false);
  };

  const handlePointDrag = (pointId: string, x: number, y: number) => {
    setPoints(prev => prev.map(point => 
      point.id === pointId 
        ? { ...point, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
        : point
    ));
  };

  const handleDeletePoint = (pointId: string) => {
    setPoints(prev => prev.filter(point => point.id !== pointId));
    setSelectedPoint(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, pointId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedPoint(selectedPoint === pointId ? null : pointId);
    } else if (e.key === 'Delete' && selectedPoint === pointId) {
      handleDeletePoint(pointId);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Security Queue Flow Monitor</h3>
          <p className="text-sm text-gray-400">Interactive checkpoint monitoring and analytics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors bg-white/10 text-gray-300 hover:bg-white/20"
          >
            <Package className="w-4 h-4" />
            Upload Image
          </button>
          <button
            onClick={() => setIsAddingPoint(!isAddingPoint)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isAddingPoint 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            {isAddingPoint ? 'Click to Add' : 'Add Point'}
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative bg-gray-900 rounded-lg overflow-hidden border border-white/20"
        style={{ 
          minHeight: '400px',
          backgroundImage: `url(/airport_security.png)`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      >
        {/* Invisible overlay for interactions */}
        <div
          className="absolute inset-0 w-full h-full"
          onClick={handleImageClick}
          style={{ 
            cursor: isAddingPoint ? 'crosshair' : 'default',
            minHeight: '400px'
          }}
        />
        
        {/* Hidden image for size calculation */}
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Security Queue Flow Layout"
          className="invisible w-full h-auto object-contain"
          onLoad={updateImageSize}
        />

        {/* Interactive Points Overlay */}
        <div className="absolute inset-0" style={{ zIndex: 10 }}>
          <AnimatePresence>
            {points.map((point, index) => {
              const isSelected = selectedPoint === point.id;
              const isHovered = hoveredPoint === point.id;
              const isDragged = draggedPoint === point.id;

              return (
                <motion.div
                  key={point.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: index * 0.1 }}
                  drag
                  dragMomentum={false}
                  onDragStart={() => setDraggedPoint(point.id)}
                  onDragEnd={() => setDraggedPoint(null)}
                  onDrag={(_, info) => {
                    if (!imageRef.current) return;
                    const rect = imageRef.current.getBoundingClientRect();
                    const newX = ((info.point.x - rect.left) / rect.width) * 100;
                    const newY = ((info.point.y - rect.top) / rect.height) * 100;
                    handlePointDrag(point.id, newX, newY);
                  }}
                  className="absolute cursor-move"
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isDragged ? 50 : isSelected ? 30 : 20
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileDrag={{ scale: 1.2, zIndex: 50 }}
                >
                  {/* Point Marker */}
                  <motion.div
                    className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-lg ${getStatusColor(point.status)} ${
                      isSelected ? 'ring-4 ring-blue-400/50' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPoint(isSelected ? null : point.id);
                    }}
                    onMouseEnter={() => setHoveredPoint(point.id)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onKeyDown={(e) => handleKeyDown(e, point.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${point.label} - ${point.status} status`}
                    aria-expanded={isSelected}
                  >
                    <div className="text-white">
                      {getPointIcon(point.type)}
                    </div>
                    
                    {/* Status Pulse */}
                    {point.status === 'critical' && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-red-400"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>

                  {/* Label */}
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded shadow-lg">
                      {point.label}
                    </div>
                  </div>

                  {/* Hover Tooltip */}
                  <AnimatePresence>
                    {isHovered && !isDragged && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-50"
                      >
                        <div className="bg-gray-800 text-white p-3 rounded-lg shadow-xl border border-white/20 min-w-48">
                          <div className="font-semibold mb-2">{point.label}</div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Wait Time:</span>
                              <span>{point.stats.waitTime}min</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Throughput:</span>
                              <span>{point.stats.throughput}/hr</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Current:</span>
                              <span>{point.stats.current}/{point.stats.capacity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <span className={`capitalize ${
                                point.status === 'normal' ? 'text-green-400' :
                                point.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {point.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expanded Details Panel */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute top-16 left-1/2 transform -translate-x-1/2 z-40"
                      >
                        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-xl border border-white/20 min-w-64">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{point.label}</h4>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Edit functionality would go here
                                }}
                                className="p-1 hover:bg-white/20 rounded"
                                aria-label="Edit point"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePoint(point.id);
                                }}
                                className="p-1 hover:bg-red-500/20 rounded text-red-400"
                                aria-label="Delete point"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-400" />
                                <div>
                                  <div className="text-xs text-gray-400">Wait Time</div>
                                  <div className="font-medium">{point.stats.waitTime} min</div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-green-400" />
                                <div>
                                  <div className="text-xs text-gray-400">Throughput</div>
                                  <div className="font-medium">{point.stats.throughput}/hr</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <div className="text-xs text-gray-400 mb-1">Capacity</div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <motion.div
                                    className={`h-2 rounded-full ${
                                      point.status === 'normal' ? 'bg-green-400' :
                                      point.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                                    }`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(point.stats.current / point.stats.capacity) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                  />
                                </div>
                                <div className="text-xs mt-1">
                                  {point.stats.current}/{point.stats.capacity}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-white/20">
                            <div className="flex items-center gap-2 text-xs">
                              <Move className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-400">Drag to reposition • Click outside to close</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Add Point Instructions */}
        <AnimatePresence>
          {isAddingPoint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <div className="bg-gray-800 text-white p-4 rounded-lg shadow-xl">
                <div className="text-center">
                  <Plus className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                  <div className="font-semibold mb-1">Add New Point</div>
                  <div className="text-sm text-gray-400">Click anywhere on the image to place a new monitoring point</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Summary */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
          <div className="text-green-400 font-semibold text-sm">Normal</div>
          <div className="text-white text-lg font-bold">
            {points.filter(p => p.status === 'normal').length}
          </div>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
          <div className="text-yellow-400 font-semibold text-sm">Warning</div>
          <div className="text-white text-lg font-bold">
            {points.filter(p => p.status === 'warning').length}
          </div>
        </div>
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
          <div className="text-red-400 font-semibold text-sm">Critical</div>
          <div className="text-white text-lg font-bold">
            {points.filter(p => p.status === 'critical').length}
          </div>
        </div>
      </div>
    </div>
  );
};