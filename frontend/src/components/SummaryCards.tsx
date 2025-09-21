import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, TrendingUp, Eye } from 'lucide-react';
import { SummaryMetrics } from '../types';

interface SummaryCardsProps {
  metrics: SummaryMetrics;
  isLive?: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ metrics, isLive = false }) => {
  const cards = [
    {
      title: 'Engaged Customers',
      value: metrics.engagedCustomers,
      icon: Eye,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      suffix: ''
    },
    {
      title: 'Average Duration',
      value: metrics.averageDuration,
      icon: Clock,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      suffix: 'm'
    },
    {
      title: 'Traffic Trend',
      value: metrics.trafficTrend,
      icon: TrendingUp,
      color: metrics.trafficTrend > 0 ? 'text-green-400' : 'text-red-400',
      bgColor: metrics.trafficTrend > 0 ? 'bg-green-500/20' : 'bg-red-500/20',
      suffix: '%'
    },
    {
      title: 'Total Visitors',
      value: metrics.totalVisitors,
      icon: Users,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      suffix: ''
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 hover:scale-105 transition-transform duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              {isLive && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400">LIVE</span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">
                {card.value.toLocaleString()}{card.suffix}
              </p>
              <p className="text-sm text-gray-400">{card.title}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};