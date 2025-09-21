import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Building, MapPin, ChevronDown } from 'lucide-react';
import { useVenue } from '../../contexts/VenueContext';

export const VenueTopSelector: React.FC = () => {
  const { venues, selectedVenue, setSelectedVenue, getCurrentVenue } = useVenue();

  const getVenueIcon = (type: string) => {
    switch (type) {
      case 'airport': return <Plane className="w-5 h-5" />;
      case 'mall': return <Building className="w-5 h-5" />;
      case 'stadium': return <MapPin className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  const currentVenue = getCurrentVenue();

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 mb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Select Active Venue</h2>
        
        <div className="flex items-center gap-3">
          {venues.map(venue => (
            <button
              key={venue.id}
              onClick={() => setSelectedVenue(venue.id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all ${
                selectedVenue === venue.id
                  ? 'border-blue-500 bg-blue-500/20 text-blue-300 shadow-lg'
                  : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10'
              }`}
            >
              {getVenueIcon(venue.type)}
              <div className="text-left">
                <div className="font-medium text-sm">{venue.name}</div>
                <div className="text-xs opacity-75">{venue.zones.length} zones</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {currentVenue && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-white/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getVenueIcon(currentVenue.type)}
              <span className="text-white font-medium">Active: {currentVenue.name}</span>
            </div>
            <div className="text-sm text-gray-400">
              Managing {currentVenue.zones.length} operational zones
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};