import React from 'react';
import { motion } from 'framer-motion';

interface Venue {
  id: string;
  name: string;
  type: 'stadium' | 'mall' | 'airport' | 'concert_hall';
  icon: string;
  description: string;
  malaysianLocation: string;
}

interface VenueSelectorProps {
  venues: Venue[];
  selectedVenue: Venue | null;
  onVenueSelect: (venue: Venue) => void;
}

const VenueSelector: React.FC<VenueSelectorProps> = ({
  venues,
  selectedVenue,
  onVenueSelect
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        🏛️ Select Malaysian Venue
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {venues.map((venue, index) => (
          <motion.button
            key={venue.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onVenueSelect(venue)}
            className={`
              relative p-6 rounded-lg border-2 transition-all duration-300
              ${selectedVenue?.id === venue.id
                ? 'border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/25'
                : 'border-white/30 bg-white/5 hover:border-blue-400 hover:bg-blue-400/10'
              }
            `}
          >
            {/* Selection Indicator */}
            {selectedVenue?.id === venue.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
              >
                <span className="text-black text-sm font-bold">✓</span>
              </motion.div>
            )}

            {/* Venue Icon */}
            <div className="text-4xl mb-3 filter drop-shadow-lg">
              {venue.icon}
            </div>

            {/* Venue Info */}
            <h3 className="text-white font-bold text-lg mb-2 leading-tight">
              {venue.name}
            </h3>
            
            <p className="text-blue-200 text-sm mb-2 line-clamp-2">
              {venue.description}
            </p>
            
            <div className="flex items-center justify-center text-yellow-300 text-xs">
              <span className="mr-1">📍</span>
              {venue.malaysianLocation}
            </div>

            {/* Hover Effect Overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-lg opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          </motion.button>
        ))}
      </div>

      {/* Selected Venue Info */}
      {selectedVenue && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-6 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-400/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{selectedVenue.icon}</span>
              <div>
                <h4 className="text-white font-bold text-lg">
                  {selectedVenue.name}
                </h4>
                <p className="text-blue-200 text-sm">
                  {selectedVenue.description}
                </p>
              </div>
            </div>
            
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-green-400 text-xl"
            >
              ✨
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VenueSelector;