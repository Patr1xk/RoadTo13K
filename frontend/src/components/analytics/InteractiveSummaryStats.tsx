import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  BarChart3, 
  Info, 
  ChevronUp, 
  ChevronDown,
  Activity
} from 'lucide-react';

interface SummaryMetric {
  id: string;
  title: string;
  value: number;
  unit: string;
  change: number;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
  description: string;
  trend: number[];
}

interface InteractiveSummaryStatsProps {
  className?: string;
}

export const InteractiveSummaryStats: React.FC<InteractiveSummaryStatsProps> = ({ className = '' }) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});

  const metrics: SummaryMetric[] = [
    {
      id: 'occupancy',
      title: 'Current Occupancy',
      value: 1247,
      unit: 'people',
      change: 12.5,
      status: 'good',
      icon: <Users className="w-6 h-6" />,
      description: 'Total number of people currently in the venue',
      trend: [1100, 1150, 1200, 1180, 1220, 1247]
    },
    {
      id: 'utilization',
      title: 'Utilization Rate',
      value: 78.3,
      unit: '%',
      change: -2.1,
      status: 'warning',
      icon: <BarChart3 className="w-6 h-6" />,
      description: 'Percentage of venue capacity currently being used',
      trend: [75, 80, 82, 79, 81, 78.3]
    },
    {
      id: 'flow',
      title: 'Flow Rate',
      value: 156,
      unit: 'people/min',
      change: 8.7,
      status: 'good',
      icon: <TrendingUp className="w-6 h-6" />,
      description: 'Average number of people moving through entry/exit points per minute',
      trend: [140, 145, 150, 148, 152, 156]
    },
    {
      id: 'dwell',
      title: 'Avg Dwell Time',
      value: 28.4,
      unit: 'minutes',
      change: -5.2,
      status: 'critical',
      icon: <Clock className="w-6 h-6" />,
      description: 'Average time visitors spend in the venue',
      trend: [32, 30, 29, 31, 30, 28.4]
    }
  ];

  // Animate counters on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      metrics.forEach(metric => {
        let start = 0;
        const end = metric.value;
        const duration = 2000;
        const increment = end / (duration / 16);
        
        const counter = setInterval(() => {
          start += increment;
          if (start >= end) {
            setAnimatedValues(prev => ({ ...prev, [metric.id]: end }));
            clearInterval(counter);
          } else {
            setAnimatedValues(prev => ({ ...prev, [metric.id]: start }));
          }
        }, 16);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'border-green-500/50 bg-green-500/10 text-green-300';
      case 'warning': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300';
      case 'critical': return 'border-red-500/50 bg-red-500/10 text-red-300';
      default: return 'border-gray-500/50 bg-gray-500/10 text-gray-300';
    }
  };

  const getChangeColor = (change: number) => {
    return change > 0 ? 'text-green-400' : 'text-red-400';
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') {
      return value.toFixed(1);
    } else if (unit === 'people' || unit === 'people/min') {
      return Math.floor(value).toLocaleString();
    } else {
      return value.toFixed(1);
    }
  };

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Live Analytics Dashboard</h2>
          <p className="text-gray-400">Real-time venue performance metrics</p>
        </div>
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const isExpanded = expandedCard === metric.id;
          const animatedValue = animatedValues[metric.id] || 0;

          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              whileHover={{ 
                scale: 1.02, 
                y: -2,
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setExpandedCard(isExpanded ? null : metric.id)}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                isExpanded 
                  ? 'border-blue-500 bg-blue-500/20 shadow-xl shadow-blue-500/25' 
                  : `${getStatusColor(metric.status)} hover:shadow-lg`
              }`}
            >
              {/* Status Indicator */}
              <div className="absolute top-2 right-2">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className={`w-3 h-3 rounded-full ${
                    metric.status === 'good' ? 'bg-green-400' :
                    metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                />
              </div>

              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  animate={{ 
                    rotate: isExpanded ? 360 : 0,
                    scale: isExpanded ? 1.1 : 1
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-blue-400"
                >
                  {metric.icon}
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm">{metric.title}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Info className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">Click for details</span>
                  </div>
                </div>
              </div>

              {/* Main Value */}
              <div className="mb-3">
                <div className="flex items-baseline gap-1">
                  <motion.span
                    key={animatedValue}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-white"
                  >
                    {formatValue(animatedValue, metric.unit)}
                  </motion.span>
                  <span className="text-sm text-gray-400">{metric.unit}</span>
                </div>
                
                {/* Progress Bar for Percentage Values */}
                {metric.unit === '%' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(animatedValue, 100)}%` }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className={`h-2 rounded-full ${
                          metric.status === 'good' ? 'bg-green-400' :
                          metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Change Indicator */}
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1 text-sm ${getChangeColor(metric.change)}`}>
                  {metric.change > 0 ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <span className="font-medium">
                    {Math.abs(metric.change).toFixed(1)}%
                  </span>
                </div>
                <span className="text-xs text-gray-400">vs last hour</span>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-white/20"
                  >
                    <p className="text-xs text-gray-300 mb-3">{metric.description}</p>
                    
                    {/* Mini Trend Chart */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-2">6-Hour Trend</div>
                      <div className="flex items-end gap-1 h-8">
                        {metric.trend.map((value, i) => {
                          const height = (value / Math.max(...metric.trend)) * 100;
                          return (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ duration: 0.5, delay: i * 0.1 }}
                              className={`flex-1 rounded-t ${
                                i === metric.trend.length - 1 ? 'bg-blue-400' : 'bg-gray-600'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-xs hover:bg-blue-500/30 transition-colors"
                    >
                      <Activity className="w-3 h-3" />
                      View Detailed Analytics
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Glow Effect for Updates */}
              <motion.div
                animate={{ 
                  opacity: [0, 0.3, 0],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-blue-400/20 rounded-xl pointer-events-none"
                style={{ 
                  filter: 'blur(8px)',
                  zIndex: -1
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Live Update Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-400"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-2 h-2 bg-green-400 rounded-full"
        />
        <span>Live data • Updates every 30 seconds</span>
      </motion.div>
    </div>
  );
};