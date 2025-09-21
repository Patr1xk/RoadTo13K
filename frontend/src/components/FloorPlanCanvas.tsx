import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zone, ZoneStats, HeatmapConfig, ZoneHeatmap, HeatmapPoint, CongestionPrediction, PredictionConfig } from '../types';
import { HeatmapOverlay } from './HeatmapOverlay';
import { CircularHeatmapOverlay } from './CircularHeatmapOverlay';
import { PredictionOverlay } from './PredictionOverlay';

interface FloorPlanCanvasProps {
  zones: Zone[];
  zoneStats?: ZoneStats[];
  predictions?: CongestionPrediction[];
  config?: PredictionConfig;
  showPredictions?: boolean;
  isLive?: boolean;
  onStatsUpdate?: (newStats: ZoneStats[]) => void;
  heatmapConfig?: HeatmapConfig;
}

interface ResponsiveZone extends Zone {
  scaledX: number;
  scaledY: number;
  scaledWidth: number;
  scaledHeight: number;
  labelPosition: 'inside' | 'top' | 'bottom' | 'left' | 'right';
}

export const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({
  zones,
  zoneStats = [],
  predictions = [],
  config,
  showPredictions = false,
  isLive = false,
  onStatsUpdate,
  heatmapConfig = {
    enabled: true,
    updateInterval: 8000,
    intensityThreshold: { low: 0.25, medium: 0.5, high: 0.75 },
    colors: { low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626' },
    blur: 3,
    opacity: 0.7
  }
}) => {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [responsiveZones, setResponsiveZones] = useState<ResponsiveZone[]>([]);
  const [containerDimensions, setContainerDimensions] = useState({ width: 900, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Base floorplan dimensions (SVG viewBox)
  const baseDimensions = { width: 900, height: 600 };

  // Calculate responsive zone positions and prevent overlaps
  const calculateResponsiveZones = useCallback((containerWidth: number, containerHeight: number) => {
    const scaleX = containerWidth / baseDimensions.width;
    const scaleY = containerHeight / baseDimensions.height;
    const scale = Math.min(scaleX, scaleY);

    const scaledZones: ResponsiveZone[] = zones.map(zone => {
      const scaledX = zone.x * scale;
      const scaledY = zone.y * scale;
      const scaledWidth = zone.width * scale;
      const scaledHeight = zone.height * scale;

      return {
        ...zone,
        scaledX,
        scaledY,
        scaledWidth,
        scaledHeight,
        labelPosition: 'inside'
      };
    });

    // Ensure no overlaps by maintaining original positions
    const adjustedZones = scaledZones.map(zone => {
      // Add 2px margin to prevent visual overlap
      return {
        ...zone,
        scaledX: zone.scaledX + 2,
        scaledY: zone.scaledY + 2,
        scaledWidth: Math.max(60, zone.scaledWidth - 4),
        scaledHeight: Math.max(30, zone.scaledHeight - 4)
      };
    });

    return adjustedZones;
  }, [zones, baseDimensions]);

  // Generate mock heatmap data for zones with circular patterns
  const generateHeatmapData = useCallback((zoneId: string, occupancy: number, capacity: number): ZoneHeatmap => {
    const utilizationRate = occupancy / capacity;
    const numPoints = Math.floor(utilizationRate * 6) + 3;
    
    const points: HeatmapPoint[] = [];
    
    // Create clustered circular patterns
    for (let i = 0; i < numPoints; i++) {
      // Create clusters around certain areas
      const clusterCenterX = 20 + (i % 3) * 30 + Math.random() * 10;
      const clusterCenterY = 25 + Math.floor(i / 3) * 25 + Math.random() * 10;
      
      // Add some randomness but keep within zone bounds
      const x = Math.max(10, Math.min(90, clusterCenterX + (Math.random() - 0.5) * 20));
      const y = Math.max(10, Math.min(90, clusterCenterY + (Math.random() - 0.5) * 20));
      
      const baseIntensity = utilizationRate * 0.8;
      const intensity = Math.max(0.1, Math.min(1, baseIntensity + (Math.random() - 0.5) * 0.4));
      
      points.push({
        x,
        y,
        intensity,
        timestamp: new Date()
      });
    }
    
    return {
      zoneId,
      points,
      maxIntensity: Math.max(...points.map(p => p.intensity)),
      lastUpdated: new Date()
    };
  }, []);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setContainerDimensions({ width: clientWidth, height: clientHeight });
        setResponsiveZones(calculateResponsiveZones(clientWidth, clientHeight));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateResponsiveZones]);

  // Initialize heatmap data for existing zones
  useEffect(() => {
    if (heatmapConfig.enabled && zoneStats.length > 0) {
      const statsWithHeatmap = zoneStats.map(stat => ({
        ...stat,
        heatmap: stat.heatmap || generateHeatmapData(stat.zoneId, stat.occupancy, stat.capacity)
      }));
      
      if (onStatsUpdate && statsWithHeatmap.some(stat => !zoneStats.find(z => z.zoneId === stat.zoneId)?.heatmap)) {
        onStatsUpdate(statsWithHeatmap);
      }
    }
  }, [zoneStats, heatmapConfig.enabled, generateHeatmapData, onStatsUpdate]);



  // Smooth heatmap updates with stable intervals
  useEffect(() => {
    if (isLive && heatmapConfig.enabled) {
      const updateInterval = 8000; // 8-second interval for better stability
      const interval = setInterval(() => {
        const updatedStats = zoneStats.map(stat => {
          // Very gradual changes to prevent flickering
          const occupancyChange = (Math.random() - 0.5) * 6; // Even smaller changes
          const newOccupancy = Math.max(10, Math.min(stat.capacity, stat.occupancy + occupancyChange));
          const flowChange = (Math.random() - 0.5) * 2;
          const newTrafficFlow = Math.max(1, stat.trafficFlow + flowChange);
          
          // Only update heatmap if significant change
          const shouldUpdateHeatmap = Math.abs(occupancyChange) > 3 || !stat.heatmap;
          
          return {
            ...stat,
            occupancy: newOccupancy,
            trafficFlow: newTrafficFlow,
            heatmap: shouldUpdateHeatmap ? generateHeatmapData(stat.zoneId, newOccupancy, stat.capacity) : stat.heatmap
          };
        });
        
        if (onStatsUpdate) {
          onStatsUpdate(updatedStats);
        }
        setAnimationKey(prev => prev + 1);
      }, updateInterval);
      
      
      return () => clearInterval(interval);
    }
  }, [isLive, zoneStats, onStatsUpdate, heatmapConfig, generateHeatmapData]);

  const getTrafficLevel = (occupancy: number, capacity: number): 'low' | 'medium' | 'high' => {
    const ratio = occupancy / capacity;
    if (ratio > 0.75) return 'high';
    if (ratio > 0.45) return 'medium';
    return 'low';
  };

  const getZoneStyle = (trafficLevel: 'low' | 'medium' | 'high') => {
    const styles = {
      low: {
        backgroundColor: 'rgba(34, 197, 94, 0.25)',
        borderColor: '#22c55e',
        boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)'
      },
      medium: {
        backgroundColor: 'rgba(245, 158, 11, 0.35)',
        borderColor: '#f59e0b',
        boxShadow: '0 0 12px rgba(245, 158, 11, 0.5)'
      },
      high: {
        backgroundColor: 'rgba(239, 68, 68, 0.45)',
        borderColor: '#ef4444',
        boxShadow: '0 0 16px rgba(239, 68, 68, 0.6)'
      }
    };
    return styles[trafficLevel];
  };

  const getAnimationProps = (trafficLevel: 'low' | 'medium' | 'high') => {
    switch (trafficLevel) {
      case 'high':
        return {
          animate: { 
            opacity: [0.45, 0.65, 0.45],
            boxShadow: [
              '0 0 16px rgba(239, 68, 68, 0.6)',
              '0 0 24px rgba(239, 68, 68, 0.8)',
              '0 0 16px rgba(239, 68, 68, 0.6)'
            ]
          },
          transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
        };
      case 'medium':
        return {
          animate: { 
            opacity: [0.35, 0.55, 0.35],
            boxShadow: [
              '0 0 12px rgba(245, 158, 11, 0.5)',
              '0 0 18px rgba(245, 158, 11, 0.7)',
              '0 0 12px rgba(245, 158, 11, 0.5)'
            ]
          },
          transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
        };
      default:
        return {
          animate: { opacity: [0.25, 0.35, 0.25] },
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        };
    }
  };

  const getLabelStyle = (zone: ResponsiveZone) => {
    const baseStyle = "absolute text-white font-medium text-center";
    const fontSize = zone.scaledWidth < 100 ? "text-xs" : zone.scaledWidth < 150 ? "text-sm" : "text-base";
    
    switch (zone.labelPosition) {
      case 'top':
        return `${baseStyle} ${fontSize} -top-8 left-0 right-0`;
      case 'bottom':
        return `${baseStyle} ${fontSize} -bottom-8 left-0 right-0`;
      case 'left':
        return `${baseStyle} ${fontSize} top-0 bottom-0 -left-20 w-16 flex flex-col justify-center`;
      case 'right':
        return `${baseStyle} ${fontSize} top-0 bottom-0 -right-20 w-16 flex flex-col justify-center`;
      default:
        return `${baseStyle} ${fontSize} inset-0 flex flex-col justify-center items-center p-1`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Stadium Floor Plan</h3>
        {isLive && (
          <div className="flex items-center gap-2 text-green-400">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">LIVE UPDATES</span>
          </div>
        )}
      </div>

      <div 
        ref={containerRef}
        className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden border border-white/10 w-full"
        style={{ height: '600px', minHeight: '400px' }}
      >
        {/* Responsive SVG floorplan background */}
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 900 600" 
          className="absolute inset-0 opacity-30"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Stadium structure */}
          <ellipse cx="450" cy="300" rx="420" ry="280" fill="none" stroke="#ffffff" strokeWidth="3" />
          <ellipse cx="450" cy="300" rx="380" ry="240" fill="none" stroke="#ffffff" strokeWidth="2" />
          
          {/* Field area */}
          <ellipse cx="450" cy="300" rx="200" ry="120" fill="none" stroke="#22c55e" strokeWidth="2" />
          
          {/* Seating sections */}
          <path d="M 150 150 Q 450 50 750 150 L 750 200 Q 450 100 150 200 Z" fill="none" stroke="#ffffff" strokeWidth="1" />
          <path d="M 150 400 Q 450 500 750 400 L 750 450 Q 450 550 150 450 Z" fill="none" stroke="#ffffff" strokeWidth="1" />
          
          {/* Concourse areas */}
          <rect x="50" y="120" width="800" height="40" fill="none" stroke="#8b5cf6" strokeWidth="1" />
          <rect x="50" y="440" width="800" height="40" fill="none" stroke="#8b5cf6" strokeWidth="1" />
          
          {/* Entrance/Exit markers */}
          <rect x="20" y="280" width="60" height="40" fill="none" stroke="#22c55e" strokeWidth="2" />
          <rect x="820" y="280" width="60" height="40" fill="none" stroke="#ef4444" strokeWidth="2" />
          <rect x="420" y="20" width="60" height="40" fill="none" stroke="#22c55e" strokeWidth="2" />
          <rect x="420" y="540" width="60" height="40" fill="none" stroke="#ef4444" strokeWidth="2" />
          
          {/* Facility markers */}
          <rect x="100" y="250" width="80" height="60" fill="none" stroke="#f59e0b" strokeWidth="1" />
          <rect x="720" y="250" width="80" height="60" fill="none" stroke="#f59e0b" strokeWidth="1" />
        </svg>

        {/* Responsive zone overlays */}
        {responsiveZones.map(zone => {
          const stats = zoneStats.find(s => s.zoneId === zone.id);
          const trafficLevel = stats ? getTrafficLevel(stats.occupancy, stats.capacity) : 'low';
          const zoneStyle = getZoneStyle(trafficLevel);
          const animationProps = getAnimationProps(trafficLevel);
          const isHovered = hoveredZone === zone.id;

          return (
            <div key={zone.id} className="absolute">
              <motion.div
                key={`${zone.id}-${animationKey}`}
                className="border-2 rounded-lg cursor-pointer transition-all duration-500 relative overflow-hidden"
                style={{
                  left: zone.scaledX,
                  top: zone.scaledY,
                  width: zone.scaledWidth,
                  height: zone.scaledHeight,
                  ...zoneStyle,
                  borderWidth: isHovered ? '3px' : '2px',
                  zIndex: isHovered ? 20 : 10
                }}
                {...animationProps}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                whileHover={{ scale: 1.02, zIndex: 30 }}
                layout={false}
              >
                {/* Circular heatmap overlay */}
                {stats && stats.heatmap && heatmapConfig.enabled && !showPredictions && (
                  <div className="absolute inset-1 rounded overflow-hidden">
                    <CircularHeatmapOverlay
                      zoneId={zone.id}
                      width={zone.scaledWidth - 8}
                      height={zone.scaledHeight - 8}
                      heatmap={stats.heatmap}
                      config={heatmapConfig}
                      className="rounded"
                    />
                  </div>
                )}
                
                {/* Prediction overlay */}
                {showPredictions && config && predictions.find(p => p.zoneId === zone.id) && (
                  <PredictionOverlay
                    zoneId={zone.id}
                    width={zone.scaledWidth}
                    height={zone.scaledHeight}
                    prediction={predictions.find(p => p.zoneId === zone.id)!}
                    config={config}
                    className="rounded"
                  />
                )}
                {/* Zone label with responsive positioning */}
                <motion.div 
                  className={getLabelStyle(zone)}
                  key={`${stats?.occupancy}-${animationKey}`}
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="font-bold drop-shadow-lg">{zone.name}</div>
                  {stats && (
                    <div className="space-y-1">
                      <div className="font-semibold">{stats.occupancy}/{stats.capacity}</div>
                      <div className="text-xs opacity-90">{Math.round(stats.trafficFlow)}/min</div>
                    </div>
                  )}
                </motion.div>

                {/* Traffic indicator */}
                <motion.div 
                  className={`absolute top-1 right-1 w-3 h-3 rounded-full border border-white ${
                    trafficLevel === 'high' ? 'bg-red-500' :
                    trafficLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  animate={trafficLevel === 'high' ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />


              </motion.div>

              {/* Enhanced hover tooltip */}
              <AnimatePresence>
                {isHovered && (stats || showPredictions) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    className="absolute z-50 glass-card p-4 min-w-56 pointer-events-none shadow-2xl"
                    style={{
                      left: zone.scaledX + zone.scaledWidth + 15,
                      top: Math.max(10, zone.scaledY - 20),
                      maxWidth: '280px'
                    }}
                  >
                    <h4 className="font-bold text-white mb-3">{zone.name}</h4>
                    
                    {/* Current stats */}
                    {stats && !showPredictions && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Occupancy:</span>
                          <span className="text-white font-semibold">{stats.occupancy}/{stats.capacity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Traffic Flow:</span>
                          <span className="text-white font-semibold">{Math.round(stats.trafficFlow)}/min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Status:</span>
                          <span className={`font-bold capitalize ${
                            trafficLevel === 'high' ? 'text-red-300' :
                            trafficLevel === 'medium' ? 'text-yellow-300' : 'text-green-300'
                          }`}>
                            {trafficLevel}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Prediction info */}
                    {showPredictions && (() => {
                      const prediction = predictions.find(p => p.zoneId === zone.id);
                      if (!prediction) return <div className="text-gray-400 text-sm">No predictions available</div>;
                      
                      const timeToOccur = Math.floor((prediction.predictedTime.getTime() - Date.now()) / 60000);
                      return (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Predicted in:</span>
                            <span className="text-blue-300 font-semibold">{timeToOccur} minutes</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Probability:</span>
                            <span className="text-white font-semibold">{Math.round(prediction.probability * 100)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Confidence:</span>
                            <span className="text-green-300 font-semibold">{Math.round(prediction.confidence * 100)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Risk Score:</span>
                            <span className={`font-semibold ${
                              prediction.riskScore >= 80 ? 'text-red-300' :
                              prediction.riskScore >= 60 ? 'text-yellow-300' : 'text-green-300'
                            }`}>
                              {prediction.riskScore}/100
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Severity:</span>
                            <span className={`font-bold capitalize ${
                              prediction.severity === 'critical' ? 'text-red-300' :
                              prediction.severity === 'high' ? 'text-orange-300' :
                              prediction.severity === 'medium' ? 'text-yellow-300' : 'text-green-300'
                            }`}>
                              {prediction.severity}
                            </span>
                          </div>
                          {prediction.factors.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-white/20">
                              <div className="text-gray-300 text-xs mb-1">Key Factors:</div>
                              <div className="text-xs text-gray-400">
                                {prediction.factors.slice(0, 2).join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Traffic legend and heatmap controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500/30 border-2 border-green-500 rounded"></div>
            <span className="text-gray-300">Low Traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500/30 border-2 border-yellow-500 rounded"></div>
            <span className="text-gray-300">Medium Traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500/40 border-2 border-red-500 rounded animate-pulse"></div>
            <span className="text-gray-300">High Traffic</span>
          </div>
          {heatmapConfig.enabled && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/20">
              <div className="w-4 h-4 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded"></div>
              <span className="text-gray-300">Heat Intensity</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {heatmapConfig.enabled && isLive && (
            <div className="text-xs text-blue-400">
              Heatmap: ON
            </div>
          )}
          {isLive && (
            <div className="text-xs text-gray-400">
              Updates every 7s
            </div>
          )}
        </div>
      </div>


    </motion.div>
  );
};