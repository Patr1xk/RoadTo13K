import React, { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Eye, EyeOff, Download, Search, Focus, ArrowUp, ArrowDown, ZoomIn, ZoomOut } from 'lucide-react';
import { OccupancyTrendData, ChartSeries, ChartTooltipData, ChartViewMode } from '../../types';

interface OccupancyChartProps {
  data: OccupancyTrendData[];
  selectedZones: string[];
  timeRange: { start: Date; end: Date };
  chartType: 'line' | 'bar';
  onZoneToggle: (zoneId: string) => void;
  onTimeRangeChange: (start: Date, end: Date) => void;
  viewMode?: ChartViewMode;
  onViewModeChange?: (mode: ChartViewMode) => void;
}

interface EnhancedChartLineProps {
  series: ChartSeries;
  chartDimensions: { width: number; height: number; padding: number };
  maxValue: number;
  isHighlighted: boolean;
  isFocused: boolean;
  isDimmed: boolean;
  highlightedPoint: number | null;
  onPointHover: (data: ChartTooltipData | null, pointIndex?: number) => void;
  zoomLevel: number;
  panOffset: number;
}

interface EnhancedChartBarsProps extends EnhancedChartLineProps {}

/**
 * Enhanced chart line with glow effects and smooth animations
 */
const EnhancedChartLine: React.FC<EnhancedChartLineProps> = ({
  series,
  chartDimensions,
  maxValue,
  isHighlighted,
  isFocused,
  isDimmed,
  highlightedPoint,
  onPointHover,
  zoomLevel,
  panOffset
}) => {
  if (!series.visible || series.data.length === 0) return null;

  const adjustedPoints = series.data.map((point) => ({
    ...point,
    x: chartDimensions.padding + (point.x - chartDimensions.padding) * zoomLevel + panOffset,
    y: point.y
  }));

  const pathData = adjustedPoints.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');

  const opacity = isDimmed ? 0.2 : isFocused ? 1 : isHighlighted ? 0.9 : 0.7;
  const strokeWidth = isFocused ? 4 : isHighlighted ? 3 : 2;

  return (
    <g opacity={opacity}>
      {/* Glow effect for focused/highlighted lines */}
      {(isFocused || isHighlighted) && (
        <motion.path
          d={pathData}
          fill="none"
          stroke={series.color}
          strokeWidth={strokeWidth + 2}
          opacity={0.3}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          filter="blur(2px)"
        />
      )}
      
      {/* Main line */}
      <motion.path
        d={pathData}
        fill="none"
        stroke={series.color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="drop-shadow-lg"
      />
      
      {/* Interactive points */}
      {adjustedPoints.map((point, index) => (
        <motion.circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={highlightedPoint === index ? 7 : isFocused ? 5 : 4}
          fill={series.color}
          stroke="white"
          strokeWidth={highlightedPoint === index ? 3 : 2}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: index * 0.02 }}
          className="cursor-pointer transition-all filter drop-shadow-md"
          onMouseEnter={() => {
            if (point.metadata) {
              const tooltipData: ChartTooltipData = {
                timestamp: point.metadata.timestamp,
                zoneName: point.metadata.zoneName,
                actual: point.metadata.occupancy,
                predicted: point.metadata.predicted,
                confidence: point.metadata.confidence
              };
              onPointHover(tooltipData, index);
            }
          }}
          onMouseLeave={() => onPointHover(null)}
          whileHover={{ scale: 1.3, filter: "drop-shadow(0 0 8px currentColor)" }}
        />
      ))}
    </g>
  );
};

/**
 * Enhanced chart bars with responsive opacity and borders
 */
const EnhancedChartBars: React.FC<EnhancedChartBarsProps> = ({
  series,
  chartDimensions,
  maxValue,
  isHighlighted,
  isFocused,
  isDimmed,
  highlightedPoint,
  onPointHover,
  zoomLevel,
  panOffset
}) => {
  if (!series.visible || series.data.length === 0) return null;

  const barWidth = Math.max(6, (chartDimensions.width - 2 * chartDimensions.padding) / series.data.length * zoomLevel * 0.7);
  const baseOpacity = isDimmed ? 0.1 : isFocused ? 0.7 : isHighlighted ? 0.5 : 0.3;

  return (
    <g>
      {series.data.map((point, index) => {
        const adjustedX = chartDimensions.padding + (point.x - chartDimensions.padding) * zoomLevel + panOffset;
        const barHeight = chartDimensions.height - chartDimensions.padding - point.y;
        const isHighlightedBar = highlightedPoint === index;
        const barOpacity = isHighlightedBar ? 0.8 : baseOpacity;
        
        return (
          <motion.rect
            key={index}
            x={adjustedX - barWidth / 2}
            y={point.y}
            width={barWidth}
            height={barHeight}
            fill={series.color}
            stroke={isHighlightedBar ? "white" : series.color}
            strokeWidth={isHighlightedBar ? 2 : 1}
            opacity={barOpacity}
            rx={2}
            initial={{ height: 0, y: chartDimensions.height - chartDimensions.padding, opacity: 0 }}
            animate={{ height: barHeight, y: point.y, opacity: barOpacity }}
            transition={{ duration: 1, delay: index * 0.03, ease: "easeOut" }}
            className="cursor-pointer transition-all"
            onMouseEnter={() => {
              if (point.metadata) {
                const tooltipData: ChartTooltipData = {
                  timestamp: point.metadata.timestamp,
                  zoneName: point.metadata.zoneName,
                  actual: point.metadata.occupancy,
                  predicted: point.metadata.predicted,
                  confidence: point.metadata.confidence
                };
                onPointHover(tooltipData, index);
              }
            }}
            onMouseLeave={() => onPointHover(null)}
            whileHover={{ opacity: 0.9, strokeWidth: 2 }}
          />
        );
      })}
    </g>
  );
};

/**
 * Enhanced zone selector with search and focus capabilities
 */
interface ZoneSelectorProps {
  zones: Array<{ id: string; name: string; color: string; hasActual: boolean; hasPredicted: boolean }>;
  selectedZones: string[];
  focusedZone: string | null;
  onZoneToggle: (zoneId: string) => void;
  onZoneFocus: (zoneId: string | null) => void;
  maxVisible?: number;
}

const ZoneSelector: React.FC<ZoneSelectorProps> = ({
  zones,
  selectedZones,
  focusedZone,
  onZoneToggle,
  onZoneFocus,
  maxVisible = 5
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filteredZones = zones.filter(zone => 
    zone.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleZones = showAll ? filteredZones : filteredZones.slice(0, maxVisible);
  const hasMore = filteredZones.length > maxVisible;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-300">Zone Selection</h4>
        <div className="text-xs text-gray-400">
          {selectedZones.length}/{zones.length} selected
        </div>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search zones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Zone chips */}
      <div className="space-y-2">
        {visibleZones.map((zone) => {
          const isSelected = selectedZones.includes(zone.id);
          const isFocused = focusedZone === zone.id;
          
          return (
            <motion.div
              key={zone.id}
              layout
              className={`
                flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer
                ${isFocused 
                  ? 'bg-primary-500/20 border-primary-500/50 shadow-lg shadow-primary-500/20' 
                  : isSelected 
                    ? 'bg-white/10 border-white/20' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }
              `}
              onClick={() => onZoneToggle(zone.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: zone.color }}
                  />
                  <span className="text-white font-medium text-sm">{zone.name}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  {zone.hasActual && (
                    <div className="w-3 h-0.5 bg-current opacity-80" title="Has actual data" />
                  )}
                  {zone.hasPredicted && (
                    <div className="w-3 h-2 bg-current opacity-50 rounded-sm" title="Has predicted data" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onZoneFocus(isFocused ? null : zone.id);
                  }}
                  className={`p-1 rounded transition-colors ${
                    isFocused ? 'text-primary-400' : 'text-gray-500 hover:text-white'
                  }`}
                  title={isFocused ? 'Exit focus mode' : 'Focus on this zone'}
                >
                  <Focus className="w-3 h-3" />
                </button>
                
                {isSelected ? (
                  <Eye className="w-4 h-4 text-green-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                )}
              </div>
            </motion.div>
          );
        })}
        
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            {showAll ? 'Show Less' : `Show ${filteredZones.length - maxVisible} More`}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Enhanced tooltip with delta visualization
 */
interface EnhancedTooltipProps {
  data: ChartTooltipData;
  position: { x: number; y: number };
}

const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({ data, position }) => {
  const delta = data.actual !== undefined && data.predicted !== undefined 
    ? data.actual - data.predicted 
    : null;
  
  const deltaPercentage = delta !== null && data.predicted !== undefined && data.predicted > 0
    ? (delta / data.predicted) * 100
    : null;

  const isSignificantDelta = deltaPercentage !== null && Math.abs(deltaPercentage) > 10;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      className="absolute z-50 bg-gray-900/95 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-white/20 pointer-events-none min-w-64"
      style={{ left: position.x, top: position.y, transform: 'translate(-50%, -100%)' }}
    >
      <div className="text-sm font-semibold mb-3 text-center">{data.zoneName}</div>
      <div className="text-xs text-gray-300 mb-3 text-center">
        {data.timestamp.toLocaleString()}
      </div>
      
      <div className="space-y-2">
        {data.actual !== undefined && (
          <div className="flex items-center justify-between p-2 bg-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-blue-400" />
              <span className="text-blue-300 text-sm">Actual</span>
            </div>
            <span className="font-semibold text-white">{data.actual}</span>
          </div>
        )}
        
        {data.predicted !== undefined && (
          <div className="flex items-center justify-between p-2 bg-purple-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-2 bg-purple-400 rounded-sm opacity-60" />
              <span className="text-purple-300 text-sm">Predicted</span>
            </div>
            <span className="font-semibold text-white">{data.predicted}</span>
          </div>
        )}
        
        {delta !== null && (
          <div className={`flex items-center justify-between p-2 rounded-lg ${
            isSignificantDelta 
              ? delta > 0 ? 'bg-red-500/20 border border-red-500/30' : 'bg-green-500/20 border border-green-500/30'
              : 'bg-yellow-500/20'
          }`}>
            <div className="flex items-center gap-2">
              {delta > 0 ? (
                <ArrowUp className="w-3 h-3 text-red-400" />
              ) : delta < 0 ? (
                <ArrowDown className="w-3 h-3 text-green-400" />
              ) : (
                <div className="w-3 h-0.5 bg-gray-400" />
              )}
              <span className={`text-sm ${
                delta > 0 ? 'text-red-300' : delta < 0 ? 'text-green-300' : 'text-gray-300'
              }`}>
                Delta
              </span>
            </div>
            <div className="text-right">
              <div className={`font-semibold ${
                delta > 0 ? 'text-red-400' : delta < 0 ? 'text-green-400' : 'text-gray-400'
              }`}>
                {delta > 0 ? '+' : ''}{delta}
              </div>
              {deltaPercentage !== null && (
                <div className="text-xs opacity-75">
                  ({deltaPercentage > 0 ? '+' : ''}{deltaPercentage.toFixed(1)}%)
                </div>
              )}
            </div>
          </div>
        )}
        
        {data.confidence !== undefined && (
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/10">
            <span>Confidence</span>
            <span>{(data.confidence * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Enhanced occupancy chart with professional styling and advanced interactivity
 */
export const OccupancyChart: React.FC<OccupancyChartProps> = ({
  data,
  selectedZones,
  timeRange,
  chartType,
  onZoneToggle,
  onTimeRangeChange,
  viewMode = { mode: 'actual', showDelta: false, highlightDifferences: false },
  onViewModeChange
}) => {
  const [hoveredTooltip, setHoveredTooltip] = useState<{ data: ChartTooltipData; position: { x: number; y: number } } | null>(null);
  const [highlightedPoint, setHighlightedPoint] = useState<number | null>(null);
  const [focusedZone, setFocusedZone] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState(0);
  const chartRef = useRef<SVGSVGElement>(null);
  const chartDimensions = { width: 900, height: 450, padding: 80 };

  // Process data into enhanced chart series
  const { actualSeries, predictedSeries, zoneOptions } = useMemo(() => {
    const zoneGroups = data.reduce((groups, item) => {
      if (!groups[item.zoneId]) {
        groups[item.zoneId] = { actual: [], predicted: [] };
      }
      groups[item.zoneId].actual.push(item);
      if (item.predicted !== undefined) {
        groups[item.zoneId].predicted.push({ ...item, occupancy: item.predicted });
      }
      return groups;
    }, {} as Record<string, { actual: OccupancyTrendData[]; predicted: OccupancyTrendData[] }>);

    const maxOccupancy = Math.max(...data.map(d => Math.max(d.occupancy, d.predicted || 0)));
    const timeSpan = timeRange.end.getTime() - timeRange.start.getTime();
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

    const actualSeries: ChartSeries[] = [];
    const predictedSeries: ChartSeries[] = [];
    const zoneOptions: Array<{ id: string; name: string; color: string; hasActual: boolean; hasPredicted: boolean }> = [];

    Object.entries(zoneGroups).forEach(([zoneId, zoneData], index) => {
      const color = colors[index % colors.length];
      const hasActual = zoneData.actual.length > 0;
      const hasPredicted = zoneData.predicted.length > 0;
      
      zoneOptions.push({
        id: zoneId,
        name: zoneData.actual[0]?.zoneName || zoneData.predicted[0]?.zoneName || `Zone ${zoneId}`,
        color,
        hasActual,
        hasPredicted
      });
      
      // Actual data series (lines)
      if ((viewMode.mode === 'actual' || viewMode.mode === 'comparison') && hasActual) {
        const actualPoints = zoneData.actual.map(item => ({
          x: ((item.timestamp.getTime() - timeRange.start.getTime()) / timeSpan) * 
             (chartDimensions.width - 2 * chartDimensions.padding) + chartDimensions.padding,
          y: chartDimensions.height - chartDimensions.padding - 
             (item.occupancy / maxOccupancy) * (chartDimensions.height - 2 * chartDimensions.padding),
          label: `${item.zoneName}: ${item.occupancy}/${item.capacity}`,
          metadata: item
        }));

        actualSeries.push({
          id: `${zoneId}-actual`,
          name: `${zoneData.actual[0]?.zoneName} (Actual)`,
          data: actualPoints,
          color,
          type: 'actual',
          style: 'solid',
          visible: selectedZones.includes(zoneId)
        });
      }

      // Predicted data series (bars)
      if ((viewMode.mode === 'predicted' || viewMode.mode === 'comparison') && hasPredicted) {
        const predictedPoints = zoneData.predicted.map(item => ({
          x: ((item.timestamp.getTime() - timeRange.start.getTime()) / timeSpan) * 
             (chartDimensions.width - 2 * chartDimensions.padding) + chartDimensions.padding,
          y: chartDimensions.height - chartDimensions.padding - 
             (item.occupancy / maxOccupancy) * (chartDimensions.height - 2 * chartDimensions.padding),
          label: `${item.zoneName}: ${item.occupancy} (Predicted)`,
          metadata: item
        }));

        predictedSeries.push({
          id: `${zoneId}-predicted`,
          name: `${zoneData.predicted[0]?.zoneName} (Predicted)`,
          data: predictedPoints,
          color,
          type: 'predicted',
          style: 'solid',
          visible: selectedZones.includes(zoneId)
        });
      }
    });

    return { actualSeries, predictedSeries, zoneOptions };
  }, [data, selectedZones, timeRange, chartDimensions, viewMode]);

  const maxValue = useMemo(() => 
    Math.max(...data.map(d => Math.max(d.occupancy, d.predicted || 0))), [data]
  );

  const handlePointHover = useCallback((tooltipData: ChartTooltipData | null, pointIndex?: number) => {
    if (tooltipData && chartRef.current) {
      const rect = chartRef.current.getBoundingClientRect();
      setHoveredTooltip({
        data: tooltipData,
        position: { x: rect.width / 2, y: 20 }
      });
    } else {
      setHoveredTooltip(null);
    }
    setHighlightedPoint(pointIndex ?? null);
  }, []);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setZoomLevel(prev => {
      const newZoom = direction === 'in' ? Math.min(prev * 1.5, 5) : Math.max(prev / 1.5, 0.5);
      return newZoom;
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      {/* Enhanced header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-primary-400" />
            Occupancy Trends Comparison
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Interactive analysis of actual vs predicted occupancy patterns
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Comparison mode toggle */}
          <motion.button
            onClick={() => onViewModeChange?.({ 
              ...viewMode, 
              mode: viewMode.mode === 'comparison' ? 'actual' : 'comparison' 
            })}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              viewMode.mode === 'comparison'
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Compare Actual vs Predicted
          </motion.button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => handleZoom('out')}
              className="p-2 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOut className="w-4 h-4 text-gray-300" />
            </button>
            <span className="px-3 text-xs text-gray-400 min-w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => handleZoom('in')}
              className="p-2 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
              disabled={zoomLevel >= 5}
            >
              <ZoomIn className="w-4 h-4 text-gray-300" />
            </button>
          </div>

          <button className="btn-modern bg-gray-700 hover:bg-gray-600 text-sm">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Always-visible legend */}
      <motion.div
        className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
      >
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-primary-500 rounded-full shadow-lg shadow-primary-500/50"></div>
              <span className="text-white font-medium">Actual (Line)</span>
            </div>
            <div className="text-xs text-gray-400">
              Real-time occupancy data
            </div>
          </div>
          <div className="w-px h-6 bg-white/20"></div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500/60 rounded border border-purple-400/50"></div>
              <span className="text-white font-medium">Predicted (Bars)</span>
            </div>
            <div className="text-xs text-gray-400">
              AI-generated forecasts
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Enhanced chart */}
        <div className="xl:col-span-3">
          <div className="relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl border border-white/10 overflow-hidden">
            <svg
              ref={chartRef}
              width="100%"
              height={chartDimensions.height}
              viewBox={`0 0 ${chartDimensions.width} ${chartDimensions.height}`}
              className="w-full block"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Subtle grid */}
              <defs>
                <pattern id="subtleGrid" width="60" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#subtleGrid)" />
              
              {/* Enhanced Y-axis */}
              <line 
                x1={chartDimensions.padding} 
                y1={chartDimensions.padding} 
                x2={chartDimensions.padding} 
                y2={chartDimensions.height - chartDimensions.padding}
                stroke="rgba(255,255,255,0.15)" 
                strokeWidth="2"
              />
              
              {/* Y-axis labels with better spacing */}
              {[0, 20, 40, 60, 80, 100].map(percent => {
                const y = chartDimensions.height - chartDimensions.padding - 
                         (percent / 100) * (chartDimensions.height - 2 * chartDimensions.padding);
                return (
                  <g key={percent}>
                    <text
                      x={chartDimensions.padding - 15}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-gray-400 text-sm font-medium"
                    >
                      {Math.round((percent / 100) * maxValue)}
                    </text>
                    <line
                      x1={chartDimensions.padding - 8}
                      y1={y}
                      x2={chartDimensions.padding}
                      y2={y}
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="1"
                    />
                  </g>
                );
              })}
              
              {/* Predicted data (bars) - render first */}
              {predictedSeries.map(series => (
                <EnhancedChartBars
                  key={series.id}
                  series={series}
                  chartDimensions={chartDimensions}
                  maxValue={maxValue}
                  isHighlighted={true}
                  isFocused={focusedZone !== null && series.id.startsWith(focusedZone)}
                  isDimmed={focusedZone !== null && !series.id.startsWith(focusedZone)}
                  highlightedPoint={highlightedPoint}
                  onPointHover={handlePointHover}
                  zoomLevel={zoomLevel}
                  panOffset={panOffset}
                />
              ))}
              
              {/* Actual data (lines) - render on top */}
              {actualSeries.map(series => (
                <EnhancedChartLine
                  key={series.id}
                  series={series}
                  chartDimensions={chartDimensions}
                  maxValue={maxValue}
                  isHighlighted={true}
                  isFocused={focusedZone !== null && series.id.startsWith(focusedZone)}
                  isDimmed={focusedZone !== null && !series.id.startsWith(focusedZone)}
                  highlightedPoint={highlightedPoint}
                  onPointHover={handlePointHover}
                  zoomLevel={zoomLevel}
                  panOffset={panOffset}
                />
              ))}
            </svg>

            {/* Enhanced tooltip */}
            <AnimatePresence>
              {hoveredTooltip && (
                <EnhancedTooltip
                  data={hoveredTooltip.data}
                  position={hoveredTooltip.position}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Enhanced zone selector */}
        <div className="xl:col-span-1">
          <ZoneSelector
            zones={zoneOptions}
            selectedZones={selectedZones}
            focusedZone={focusedZone}
            onZoneToggle={onZoneToggle}
            onZoneFocus={setFocusedZone}
            maxVisible={6}
          />
        </div>
      </div>

      {/* Enhanced statistics */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          {[
            { label: 'Active Lines', value: actualSeries.filter(s => s.visible).length, color: 'text-blue-400' },
            { label: 'Active Bars', value: predictedSeries.filter(s => s.visible).length, color: 'text-purple-400' },
            { label: 'Data Points', value: data.length, color: 'text-green-400' },
            { label: 'Time Span', value: `${Math.round((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60))}h`, color: 'text-yellow-400' },
            { label: 'Zoom Level', value: `${Math.round(zoomLevel * 100)}%`, color: 'text-orange-400' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-sm"
            >
              <div className={`text-xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};