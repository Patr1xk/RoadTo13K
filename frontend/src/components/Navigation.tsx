import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Bell, Brain, Calendar, MapPin, TrendingUp } from 'lucide-react';

const navItems = [
  { path: '/simulation', label: 'Live Simulation', icon: BarChart3 },
  { path: '/analytics', label: 'Analytics & Venues', icon: TrendingUp },
  { path: '/floorplan', label: 'Floor Plan Setup', icon: MapPin },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/ai', label: 'AI Prediction', icon: Brain },
  { path: '/schedule', label: 'Schedule', icon: Calendar }
];

export const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="glass-card border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">
        <motion.h1 
          className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Crowd Management System
        </motion.h1>
        
        <div className="flex gap-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path === '/analytics' && location.pathname.startsWith('/analytics'));
            
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''} group relative transition-all duration-200 hover:scale-105`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-primary-400' : 'text-gray-400 group-hover:text-white'
                  }`} />
                  <span className={`font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-primary-700/10 rounded-lg -z-10"
                      layoutId="activeTab"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </nav>
  );
};