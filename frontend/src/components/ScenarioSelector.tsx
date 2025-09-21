import React from 'react';
import { motion } from 'framer-motion';
import { Scenario } from '../types';

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  selectedScenario: string;
  onScenarioChange: (scenarioId: string) => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarios,
  selectedScenario,
  onScenarioChange
}) => {
  const getScenarioIcon = (id: string) => {
    switch (id) {
      case 'entry': return '🚪';
      case 'facilities': return '🏢';
      case 'evacuation': return '🚨';
      case 'halftime': return '⏰';
      default: return '📊';
    }
  };

  return (
    <motion.div 
      className="glass-card p-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-2xl">🎯</span>
        Scenarios
      </h3>
      
      <div className="space-y-3">
        {scenarios.map((scenario, index) => (
          <motion.label
            key={scenario.id}
            className={`block cursor-pointer group`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`
              relative p-4 rounded-xl border-2 transition-all duration-300
              ${selectedScenario === scenario.id 
                ? 'border-primary-500 bg-gradient-to-r from-primary-600/20 to-primary-700/20 shadow-lg shadow-primary-500/20' 
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
              }
            `}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="scenario"
                  value={scenario.id}
                  checked={selectedScenario === scenario.id}
                  onChange={(e) => onScenarioChange(e.target.value)}
                  className="sr-only"
                />
                
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
                  ${selectedScenario === scenario.id 
                    ? 'border-primary-500 bg-primary-500' 
                    : 'border-gray-400 group-hover:border-white'
                  }
                `}>
                  {selectedScenario === scenario.id && (
                    <motion.div
                      className="w-2 h-2 bg-white rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getScenarioIcon(scenario.id)}</span>
                    <span className={`font-semibold transition-colors ${
                      selectedScenario === scenario.id ? 'text-white' : 'text-gray-200'
                    }`}>
                      {scenario.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {scenario.description}
                  </p>
                </div>
              </div>
              
              {selectedScenario === scenario.id && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-600/10 to-primary-700/10 -z-10"
                  layoutId="selectedScenario"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </div>
          </motion.label>
        ))}
      </div>
    </motion.div>
  );
};