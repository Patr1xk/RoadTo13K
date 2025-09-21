import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Calendar, ArrowRight, Building, Zap, Pin } from 'lucide-react';

interface Venue {
  id: string;
  name: string;
  type: 'stadium' | 'arena' | 'mall' | 'conference' | 'airport';
  location: string;
  capacity: number;
  image: string;
  description: string;
  features: string[];
  recentSessions: number;
  status: 'active' | 'maintenance' | 'offline';
}

const mockVenues: Venue[] = [
  {
    id: 'stadium-1',
    name: 'MetLife Stadium',
    type: 'stadium',
    location: 'East Rutherford, NJ',
    capacity: 82500,
    image: '/images/stadium-preview.jpg',
    description: 'Premier sports venue with advanced crowd management systems',
    features: ['Multi-level seating', 'VIP areas', 'Food courts', 'Emergency exits'],
    recentSessions: 15,
    status: 'active'
  },
  {
    id: 'arena-1',
    name: 'Madison Square Garden',
    type: 'arena',
    location: 'New York, NY',
    capacity: 20789,
    image: '/images/arena-preview.jpg',
    description: 'Iconic entertainment venue in the heart of Manhattan',
    features: ['Concert stage', 'Sports configuration', 'VIP suites', 'Concourses'],
    recentSessions: 23,
    status: 'active'
  },
  {
    id: 'mall-1',
    name: 'Westfield Mall',
    type: 'mall',
    location: 'White Plains, NY',
    capacity: 15000,
    image: '/images/mall-preview.jpg',
    description: 'Large shopping complex with multiple levels and zones',
    features: ['Food court', 'Retail zones', 'Parking areas', 'Service corridors'],
    recentSessions: 8,
    status: 'active'
  },
  {
    id: 'conference-1',
    name: 'Jacob K. Javits Center',
    type: 'conference',
    location: 'New York, NY',
    capacity: 50000,
    image: '/images/conference-preview.jpg',
    description: 'Major convention center with flexible exhibition spaces',
    features: ['Exhibition halls', 'Meeting rooms', 'Loading docks', 'Registration areas'],
    recentSessions: 12,
    status: 'maintenance'
  },
  {
    id: 'airport-1',
    name: 'JFK Terminal 4',
    type: 'airport',
    location: 'Queens, NY',
    capacity: 25000,
    image: '/images/airport-preview.jpg',
    description: 'International terminal with complex passenger flow patterns',
    features: ['Security checkpoints', 'Gates', 'Baggage claim', 'Retail areas'],
    recentSessions: 31,
    status: 'active'
  }
];

const getVenueIcon = (type: Venue['type']) => {
  switch (type) {
    case 'stadium': return '🏟️';
    case 'arena': return '🎪';
    case 'mall': return '🏬';
    case 'conference': return '🏢';
    case 'airport': return '✈️';
    default: return '🏢';
  }
};

const getStatusColor = (status: Venue['status']) => {
  switch (status) {
    case 'active': return 'text-green-400 bg-green-500/20';
    case 'maintenance': return 'text-yellow-400 bg-yellow-500/20';
    case 'offline': return 'text-red-400 bg-red-500/20';
    default: return 'text-gray-400 bg-gray-500/20';
  }
};

interface VenueSelectionProps {
  pinnedVenueId?: string;
  onPinVenue?: (venueId: string) => void;
}

export const VenueSelection: React.FC<VenueSelectionProps> = ({ pinnedVenueId, onPinVenue }) => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [hoveredVenue, setHoveredVenue] = useState<string | null>(null);

  const venueTypes = Array.from(new Set(mockVenues.map(v => v.type)));
  const filteredVenues = selectedType === 'all' 
    ? mockVenues 
    : mockVenues.filter(v => v.type === selectedType);

  const handleVenueSelect = (venueId: string) => {
    // Navigate to analytics page with venue context
    navigate(`/analytics?venue=${venueId}`, {
      state: { 
        venue: mockVenues.find(v => v.id === venueId),
        transition: 'venue-select'
      }
    });
  };

  const handlePinVenue = (e: React.MouseEvent, venueId: string) => {
    e.stopPropagation();
    onPinVenue?.(venueId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-5xl font-bold text-white mb-4">
          Select Venue
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Choose a venue to access detailed crowd analytics, simulation data, and management tools
        </p>
      </motion.div>

      {/* Venue Type Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center"
      >
        <div className="glass-card p-2 inline-flex gap-2">
          <motion.button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              selectedType === 'all' 
                ? 'bg-primary-500 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            All Venues ({mockVenues.length})
          </motion.button>
          {venueTypes.map(type => (
            <motion.button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 capitalize ${
                selectedType === type 
                  ? 'bg-primary-500 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {getVenueIcon(type as Venue['type'])} {type}s ({mockVenues.filter(v => v.type === type).length})
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Venues Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredVenues.map((venue, index) => (
            <motion.div
              key={venue.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.1,
                layout: { duration: 0.3 }
              }}
              className="glass-card overflow-hidden cursor-pointer group"
              onMouseEnter={() => setHoveredVenue(venue.id)}
              onMouseLeave={() => setHoveredVenue(null)}
              onClick={() => handleVenueSelect(venue.id)}
              whileHover={{ 
                scale: 1.02,
                y: -5,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Venue Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center text-6xl"
                  animate={{
                    scale: hoveredVenue === venue.id ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {getVenueIcon(venue.type)}
                </motion.div>
                
                {/* Status Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(venue.status)} z-20`}>
                  {venue.status}
                </div>

                {/* Hover Overlay */}
                <AnimatePresence>
                  {hoveredVenue === venue.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-primary-500/20 z-10 flex items-center justify-center"
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-white/20 backdrop-blur-sm rounded-full p-3"
                      >
                        <ArrowRight className="w-6 h-6 text-white" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Venue Info */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary-300 transition-colors">
                    {venue.name}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <MapPin className="w-4 h-4" />
                    {venue.location}
                  </div>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed">
                  {venue.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-bold text-white">
                      {venue.capacity.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">Capacity</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-bold text-white">
                      {venue.recentSessions}
                    </div>
                    <div className="text-xs text-gray-400">Sessions</div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-300">Key Features:</div>
                  <div className="flex flex-wrap gap-1">
                    {venue.features.slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                    {venue.features.length > 3 && (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                        +{venue.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <motion.button
                    className="flex-1 py-3 bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={venue.status === 'offline'}
                  >
                    {venue.status === 'offline' ? (
                      <>
                        <Zap className="w-4 h-4" />
                        Offline
                      </>
                    ) : (
                      <>
                        <Building className="w-4 h-4" />
                        View Analytics
                      </>
                    )}
                  </motion.button>
                  
                  {venue.status !== 'offline' && onPinVenue && (
                    <motion.button
                      onClick={(e) => handlePinVenue(e, venue.id)}
                      className={`px-3 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                        pinnedVenueId === venue.id
                          ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50'
                          : 'bg-white/10 hover:bg-white/20 text-gray-300'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={pinnedVenueId === venue.id ? 'Pinned to Front Page' : 'Pin to Front Page'}
                    >
                      <Pin className={`w-4 h-4 ${pinnedVenueId === venue.id ? 'fill-current' : ''}`} />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredVenues.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4 opacity-50">🏢</div>
          <h3 className="text-xl font-bold text-white mb-2">No venues found</h3>
          <p className="text-gray-400">Try selecting a different venue type</p>
        </motion.div>
      )}
    </div>
  );
};