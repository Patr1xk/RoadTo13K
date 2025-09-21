import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, BarChart } from 'lucide-react';
import { ZoneTypeDistribution } from '../../types';

interface DistributionByZoneTypeChartProps {
  data: ZoneTypeDistribution[];
  chartType: 'donut' | 'stacked-bar';
  onChartTypeChange: (type: 'donut' | 'stacked-bar') => void;
  onZoneTypeSelect: (type: string) => void;
  selectedZoneType: string | null;
}

interface DonutSegmentProps {
  data: ZoneTypeDistribution;
  startAngle: number;
  endAngle: number;
  radius: number;
  innerRadius: number;
  centerX: number;
  centerY: number;
  isSelected: boolean;
  onSelect: (type: string) => void;
  onHover: (type: string | null) => void;
}

const DonutSegment: React.FC<DonutSegmentProps> = ({
  data,
  startAngle,
  endAngle,
  radius,
  innerRadius,
  centerX,
  centerY,
  isSelected,
  onSelect,
  onHover
}) => {
  const startAngleRad = (startAngle * Math.PI) / 180;
  const endAngleRad = (endAngle * Math.PI) / 180;
  
  const x1 = centerX + radius * Math.cos(startAngleRad);
  const y1 = centerY + radius * Math.sin(startAngleRad);
  const x2 = centerX + radius * Math.cos(endAngleRad);
  const y2 = centerY + radius * Math.sin(endAngleRad);
  
  const x3 = centerX + innerRadius * Math.cos(endAngleRad);
  const y3 = centerY + innerRadius * Math.sin(endAngleRad);
  const x4 = centerX + innerRadius * Math.cos(startAngleRad);
  const y4 = centerY + innerRadius * Math.sin(startAngleRad);
  
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  
  const pathData = [
    `M ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
    'Z'
  ].join(' ');

  return (
    <motion.path
      d={pathData}
      fill={data.color}
      stroke="rgba(255,255,255,0.1)"
      strokeWidth="2"
      className="cursor-pointer transition-all duration-200"
      style={{
        filter: isSelected ? 'brightness(1.2) drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))' : 'none',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        transformOrigin: `${centerX}px ${centerY}px`
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: isSelected ? 1.05 : 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      onMouseEnter={() => onHover(data.type)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(data.type)}
      whileHover={{ scale: 1.02 }}
    />
  );
};

interface StackedBarProps {
  data: ZoneTypeDistribution[];
  selectedZoneType: string | null;
  onZoneTypeSelect: (type: string) => void;
}

const StackedBar: React.FC<StackedBarProps> = ({
  data,
  selectedZoneType,
  onZoneTypeSelect
}) => {
  const maxValue = Math.max(...data.map(d => d.totalCapacity));
  const barHeight = 40;
  const barWidth = 400;

  return (
    <div className="space-y-4">
      {['totalCapacity', 'avgOccupancy', 'peakOccupancy'].map((metric, metricIndex) => (
        <div key={metric} className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300 capitalize">
            {metric.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </h4>
          
          <div className="relative">
            <svg width={barWidth} height={barHeight} className="rounded-lg overflow-hidden">
              {data.map((item, index) => {
                const value = item[metric as keyof ZoneTypeDistribution] as number;
                const percentage = (value / maxValue) * 100;
                const x = data.slice(0, index).reduce((sum, d) => 
                  sum + ((d[metric as keyof ZoneTypeDistribution] as number) / maxValue) * barWidth, 0
                );
                const width = (value / maxValue) * barWidth;
                
                return (
                  <motion.rect
                    key={`${metric}-${item.type}`}
                    x={x}
                    y={0}
                    width={width}
                    height={barHeight}
                    fill={item.color}
                    className="cursor-pointer"
                    style={{
                      filter: selectedZoneType === item.type ? 'brightness(1.2)' : 'none'
                    }}
                    initial={{ width: 0 }}
                    animate={{ width }}
                    transition={{ duration: 1, delay: metricIndex * 0.2 + index * 0.1 }}
                    onClick={() => onZoneTypeSelect(item.type)}
                    whileHover={{ scale: 1.02 }}
                  />
                );
              })}
            </svg>
            
            {/* Value labels */}
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>0</span>
              <span>{maxValue}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const DistributionByZoneTypeChart: React.FC<DistributionByZoneTypeChartProps> = ({
  data,
  chartType,
  onChartTypeChange,
  onZoneTypeSelect,
  selectedZoneType
}) => {
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  
  const totalCapacity = data.reduce((sum, item) => sum + item.totalCapacity, 0);
  const chartSize = 200;
  const centerX = chartSize / 2;
  const centerY = chartSize / 2;
  const radius = 80;
  const innerRadius = 50;

  const processedData = data.map((item, index) => {
    const percentage = (item.totalCapacity / totalCapacity) * 100;
    const startAngle = data.slice(0, index).reduce((sum, d) => 
      sum + (d.totalCapacity / totalCapacity) * 360, 0
    );
    const endAngle = startAngle + (item.totalCapacity / totalCapacity) * 360;
    
    return { ...item, percentage, startAngle, endAngle };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 h-fit"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <PieChart className="w-6 h-6 text-primary-400" />
          Distribution by Zone Type
        </h3>
        
        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => onChartTypeChange('donut')}
            className={`p-2 rounded transition-colors ${
              chartType === 'donut' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <PieChart className="w-4 h-4" />
          </button>
          <button
            onClick={() => onChartTypeChange('stacked-bar')}
            className={`p-2 rounded transition-colors ${
              chartType === 'stacked-bar' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Chart visualization */}
        <div className="flex justify-center">
          {chartType === 'donut' ? (
            <div className="relative">
              <svg width={chartSize} height={chartSize}>
                {processedData.map(item => (
                  <DonutSegment
                    key={item.type}
                    data={item}
                    startAngle={item.startAngle}
                    endAngle={item.endAngle}
                    radius={radius}
                    innerRadius={innerRadius}
                    centerX={centerX}
                    centerY={centerY}
                    isSelected={selectedZoneType === item.type}
                    onSelect={onZoneTypeSelect}
                    onHover={setHoveredType}
                  />
                ))}
              </svg>
              
              {/* Center label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{totalCapacity}</div>
                  <div className="text-xs text-gray-400">Total Capacity</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <StackedBar
                data={data}
                selectedZoneType={selectedZoneType}
                onZoneTypeSelect={onZoneTypeSelect}
              />
            </div>
          )}
        </div>

        {/* Legend and statistics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Zone Types</h4>
          
          <div className="space-y-2">
            {processedData.map((item, index) => (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  p-3 rounded-lg cursor-pointer transition-all duration-200
                  ${selectedZoneType === item.type 
                    ? 'bg-white/15 border border-white/30' 
                    : 'bg-white/5 hover:bg-white/10'
                  }
                `}
                onClick={() => onZoneTypeSelect(item.type)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-white text-sm capitalize">{item.label}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                  <div>
                    <span className="text-gray-400">Cap:</span> {item.totalCapacity}
                  </div>
                  <div>
                    <span className="text-gray-400">Avg:</span> {item.avgOccupancy}
                  </div>
                  <div>
                    <span className="text-gray-400">Peak:</span> {item.peakOccupancy}
                  </div>
                  <div>
                    <span className="text-gray-400">Util:</span> {item.utilizationRate.toFixed(1)}%
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Hover tooltip for donut chart */}
      {hoveredType && chartType === 'donut' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute z-10 bg-gray-900 text-white p-3 rounded-lg shadow-lg pointer-events-none"
        >
          {processedData.find(d => d.type === hoveredType)?.label}
        </motion.div>
      )}
    </motion.div>
  );
};