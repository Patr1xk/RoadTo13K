import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { CrowdData } from '../types';

interface HeatmapMapProps {
  data: CrowdData[];
  width: number;
  height: number;
}

export const HeatmapMap: React.FC<HeatmapMapProps> = ({ data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    setIsLoading(true);
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
      .domain([0, d3.max(data, d => d.density) || 1]);

    const cellSize = Math.min(width / 30, height / 20);
    
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => d.x * cellSize)
      .attr('y', d => d.y * cellSize)
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('fill', d => colorScale(d.density))
      .attr('opacity', 0)
      .style('cursor', 'pointer')
      .transition()
      .duration(800)
      .delay((d, i) => i * 2)
      .attr('opacity', 1)
      .on('end', () => setIsLoading(false));

    svg.selectAll('rect')
      .on('mouseover', (event, d) => {
        const data = d as CrowdData;
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip({
          x: event.clientX - rect.left + 10,
          y: event.clientY - rect.top - 10,
          content: `${data.area}\nDensity: ${data.density.toFixed(1)} people/m²`
        });
        
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr('stroke', '#3b82f6')
          .attr('stroke-width', 2);
      })
      .on('mouseout', (event) => {
        setTooltip(null);
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr('stroke', 'none');
      });
  }, [data, width, height]);

  return (
    <motion.div 
      className="relative glass-card p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Real-Time Heatmap</h3>
        {isLoading && (
          <div className="flex items-center gap-2 text-primary-400">
            <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Updating...</span>
          </div>
        )}
      </div>
      
      <div className="relative overflow-hidden rounded-lg glow-border">
        <svg 
          ref={svgRef} 
          width={width} 
          height={height} 
          className="w-full h-auto bg-gradient-to-br from-dark-800 to-dark-900"
        />
        
        <AnimatePresence>
          {tooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 bg-dark-800/90 backdrop-blur-sm text-white p-3 rounded-lg border border-white/20 shadow-xl"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <div className="text-sm font-medium whitespace-pre-line">
                {tooltip.content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span className="text-gray-300">Low Density</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-gray-300">Medium Density</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-300">High Density</span>
        </div>
      </div>
    </motion.div>
  );
};