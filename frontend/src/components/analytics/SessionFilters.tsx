import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Filter, X, Clock, Tag } from 'lucide-react';
import { SimulationSession } from '../../types';

interface SessionFiltersProps {
  /** Array of all available sessions for filter options */
  sessions: SimulationSession[];
  /** Current filter values */
  filters: {
    search: string;
    location: string;
    floorplan: string;
    scenario: string;
    dateRange: { start: string; end: string };
  };
  /** Callback when filters change */
  onFiltersChange: (filters: SessionFiltersProps['filters']) => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Enhanced interactive filtering component for simulation sessions
 * Features sticky positioning, smooth animations, and real-time filtering
 */
export const SessionFilters: React.FC<SessionFiltersProps> = ({
  sessions,
  filters,
  onFiltersChange,
  isLoading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [filteredCount, setFilteredCount] = useState(sessions.length);

  // Track scroll position for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update filtered count when filters change
  useEffect(() => {
    const filtered = sessions.filter(session => {
      const matchesSearch = !filters.search || 
        session.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        session.location.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesLocation = filters.location === 'all' || session.location === filters.location;
      const matchesFloorplan = filters.floorplan === 'all' || session.floorplan === filters.floorplan;
      const matchesScenario = filters.scenario === 'all' || session.scenario === filters.scenario;
      
      const matchesDateRange = (!filters.dateRange.start || session.date >= new Date(filters.dateRange.start)) &&
                              (!filters.dateRange.end || session.date <= new Date(filters.dateRange.end));
      
      return matchesSearch && matchesLocation && matchesFloorplan && matchesScenario && matchesDateRange;
    });
    setFilteredCount(filtered.length);
  }, [sessions, filters]);

  // Extract unique filter options from sessions
  const locations = Array.from(new Set(sessions.map(s => s.location)));
  const floorplans = Array.from(new Set(sessions.map(s => s.floorplan)));
  const scenarios = Array.from(new Set(sessions.map(s => s.scenario)));

  const updateFilter = (key: keyof typeof filters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      location: 'all',
      floorplan: 'all',
      scenario: 'all',
      dateRange: { start: '', end: '' }
    });
  };

  const hasActiveFilters = filters.search || 
    filters.location !== 'all' || 
    filters.floorplan !== 'all' || 
    filters.scenario !== 'all' || 
    filters.dateRange.start || 
    filters.dateRange.end;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isSticky ? 0.98 : 1
      }}
      transition={{ duration: 0.3 }}
      className={`glass-card p-4 space-y-4 transition-all duration-300 ${
        isSticky ? 'fixed top-4 left-6 right-6 z-50 shadow-2xl backdrop-blur-xl' : 'relative'
      }`}
      style={{
        background: isSticky ? 'rgba(17, 24, 39, 0.95)' : undefined
      }}
    >
      {/* Enhanced search and controls */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <motion.input
            type="text"
            placeholder="Search sessions, locations, scenarios..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            disabled={isLoading}
            className="w-full pl-10 pr-20 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none transition-all duration-200 disabled:opacity-50 focus:bg-white/10"
            whileFocus={{ scale: 1.02 }}
          />
          {filters.search && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => updateFilter('search', '')}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-3 h-3 text-gray-400" />
            </motion.button>
          )}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
            {filteredCount}/{sessions.length}
          </div>
        </div>
        
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-3 rounded-lg transition-all duration-200 ${
            hasActiveFilters ? 'bg-primary-500/20 text-primary-300' : 'bg-white/5 hover:bg-white/10 text-gray-400'
          }`}
          title="Advanced filters"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Filter className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </motion.button>

        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 10 }}
              onClick={clearFilters}
              className="p-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors text-red-400"
              title="Clear all filters"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced advanced filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10"
          >
          {/* Enhanced Location filter */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-400" />
              Location
            </label>
            <motion.select
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              disabled={isLoading}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none disabled:opacity-50 transition-all duration-200 hover:bg-white/10"
              whileFocus={{ scale: 1.02 }}
            >
              <option value="all" className="bg-gray-800">All Locations ({locations.length})</option>
              {locations.map(location => (
                <option key={location} value={location} className="bg-gray-800">
                  📍 {location}
                </option>
              ))}
            </motion.select>
          </motion.div>

          {/* Enhanced Floorplan filter */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Floorplan
            </label>
            <motion.select
              value={filters.floorplan}
              onChange={(e) => updateFilter('floorplan', e.target.value)}
              disabled={isLoading}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none disabled:opacity-50 transition-all duration-200 hover:bg-white/10"
              whileFocus={{ scale: 1.02 }}
            >
              <option value="all" className="bg-gray-800">All Floorplans ({floorplans.length})</option>
              {floorplans.map(floorplan => (
                <option key={floorplan} value={floorplan} className="bg-gray-800">
                  🏗️ {floorplan}
                </option>
              ))}
            </motion.select>
          </motion.div>

          {/* Enhanced Scenario filter */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400" />
              Scenario
            </label>
            <motion.select
              value={filters.scenario}
              onChange={(e) => updateFilter('scenario', e.target.value)}
              disabled={isLoading}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none disabled:opacity-50 transition-all duration-200 hover:bg-white/10"
              whileFocus={{ scale: 1.02 }}
            >
              <option value="all" className="bg-gray-800">All Scenarios ({scenarios.length})</option>
              {scenarios.map(scenario => (
                <option key={scenario} value={scenario} className="bg-gray-800">
                  🎭 {scenario}
                </option>
              ))}
            </motion.select>
          </motion.div>

          {/* Enhanced Date range filter */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-yellow-400" />
              Date Range
            </label>
            <div className="space-y-2">
              <motion.input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                disabled={isLoading}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none disabled:opacity-50 transition-all duration-200 hover:bg-white/10"
                whileFocus={{ scale: 1.02 }}
                placeholder="Start date"
              />
              <motion.input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                disabled={isLoading}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none disabled:opacity-50 transition-all duration-200 hover:bg-white/10"
                whileFocus={{ scale: 1.02 }}
                placeholder="End date"
              />
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced active filters summary */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-wrap gap-2 pt-3 border-t border-white/10"
          >
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Tag className="w-3 h-3" />
              Active Filters:
            </div>
            {filters.search && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30"
              >
                Search: "{filters.search}"
              </motion.span>
            )}
            {filters.location !== 'all' && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium border border-green-500/30"
              >
                📍 {filters.location}
              </motion.span>
            )}
            {filters.scenario !== 'all' && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium border border-purple-500/30"
              >
                🎭 {filters.scenario}
              </motion.span>
            )}
            {(filters.dateRange.start || filters.dateRange.end) && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium border border-yellow-500/30"
              >
                📅 {filters.dateRange.start || 'Start'} - {filters.dateRange.end || 'End'}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};