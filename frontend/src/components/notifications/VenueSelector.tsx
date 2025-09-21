import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Building, Plane } from 'lucide-react';
import { useVenue } from '../../contexts/VenueContext';

export const VenueSelector: React.FC = () => {
  const { venues, selectedVenue, selectedZone, setSelectedVenue, setSelectedZone, getCurrentVenue } = useVenue();

  const getVenueIcon = (type: string) => {
    switch (type) {
      case 'airport': return <Plane className="w-4 h-4" />;
      case 'mall': return <Building className="w-4 h-4" />;
      case 'stadium': return <MapPin className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const handleVenueChange = (venueId: string) => {
    setSelectedVenue(venueId);
    const venue = venues.find(v => v.id === venueId);
    if (venue && venue.zones.length > 0) {
      setSelectedZone(venue.zones[0].id);
    }
  };

  const currentVenue = getCurrentVenue();

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 space-y-4">
      {/* Venue Selection */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Select Venue</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {venues.map(venue => (
            <button
              key={venue.id}
              onClick={() => handleVenueChange(venue.id)}
              className={`p-3 rounded-lg border transition-all flex items-center gap-2 ${
                selectedVenue === venue.id
                  ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                  : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40'
              }`}
            >
              {getVenueIcon(venue.type)}
              <div className="text-left">
                <div className="font-medium">{venue.name}</div>
                <div className="text-xs opacity-75 capitalize">{venue.type}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Zone Selection */}
      {currentVenue && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-white mb-3">Select Zone/Section</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {currentVenue.zones.map(zone => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone.id)}
                className={`p-2 rounded-lg border transition-all text-sm ${
                  selectedZone === zone.id
                    ? 'border-green-500 bg-green-500/20 text-green-300'
                    : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40'
                }`}
              >
                <div className="font-medium">{zone.name}</div>
                <div className="text-xs opacity-75 capitalize">{zone.type}</div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};