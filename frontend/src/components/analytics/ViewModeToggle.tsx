import React from 'react';
import { motion } from 'framer-motion';
import { Activity, History } from 'lucide-react';

interface ViewModeToggleProps {
  /** Current view mode */
  viewMode: 'live' | 'past';
  /** Callback when view mode changes */
  onViewModeChange: (mode: 'live' | 'past') => void;
  /** Loading state indicator */
  isLoading?: boolean;
}

/**
 * Interactive toggle component for switching between Live and Past simulation views
 * Maintains consistent design language with existing UI components
 */
export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onViewModeChange,
  isLoading = false
}) => {
  const toggleOptions = [
    {
      id: 'live' as const,
      label: 'Live Status',
      icon: Activity,
      description: 'Real-time crowd simulation data',
      color: 'text-green-400'
    },
    {
      id: 'past' as const,
      label: 'Past Simulations',
      icon: History,
      description: 'Historical simulation sessions',
      color: 'text-blue-400'
    }
  ];

  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
      {toggleOptions.map((option) => {
        const Icon = option.icon;
        const isActive = viewMode === option.id;
        
        return (
          <motion.button
            key={option.id}
            onClick={() => !isLoading && onViewModeChange(option.id)}
            disabled={isLoading}
            className={`
              relative flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
              ${isActive 
                ? 'text-white shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            title={option.description}
            aria-label={`Switch to ${option.label} view`}
            role="tab"
            aria-selected={isActive}
          >
            {/* Background highlight for active state */}
            {isActive && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-primary-700/20 rounded-lg border border-primary-500/30"
                layoutId="activeViewMode"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            {/* Icon with conditional styling */}
            <Icon className={`w-5 h-5 ${isActive ? option.color : 'text-current'}`} />
            
            {/* Label */}
            <span className="relative z-10">{option.label}</span>
            
            {/* Live indicator for active live mode */}
            {option.id === 'live' && isActive && (
              <motion.div
                className="flex items-center gap-1 ml-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-bold">LIVE</span>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};