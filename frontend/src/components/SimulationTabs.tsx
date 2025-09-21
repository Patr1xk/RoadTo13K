import React from 'react';
import { motion } from 'framer-motion';
import { Activity, History } from 'lucide-react';

interface SimulationTabsProps {
  activeTab: 'live' | 'past';
  onTabChange: (tab: 'live' | 'past') => void;
}

export const SimulationTabs: React.FC<SimulationTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'live', label: 'Live Simulation', icon: Activity },
    { id: 'past', label: 'Past Simulations', icon: History }
  ];

  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id as 'live' | 'past')}
            className={`
              relative flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
              ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon className="w-5 h-5" />
            <span>{tab.label}</span>
            
            {isActive && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-primary-700/20 rounded-lg border border-primary-500/30"
                layoutId="activeSimulationTab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            {tab.id === 'live' && isActive && (
              <div className="flex items-center gap-1 ml-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-bold">LIVE</span>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};