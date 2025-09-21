import React, { createContext, useContext, useState } from 'react';

interface Venue {
  id: string;
  name: string;
  type: 'airport' | 'mall' | 'stadium';
  zones: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

interface VenueContextType {
  venues: Venue[];
  selectedVenue: string;
  selectedZone: string;
  setSelectedVenue: (venueId: string) => void;
  setSelectedZone: (zoneId: string) => void;
  getCurrentVenue: () => Venue | undefined;
  getCurrentZone: () => any;
}

const venues: Venue[] = [
  {
    id: 'airport',
    name: 'Security Airport',
    type: 'airport',
    zones: [
      { id: 'pre-screening', name: 'Pre-Screening', type: 'checkpoint' },
      { id: 'baggage', name: 'Baggage Check', type: 'checkpoint' },
      { id: 'main-entrance', name: 'Main Entrance', type: 'entrance' },
      { id: 'security-gate', name: 'Security Gate', type: 'checkpoint' }
    ]
  },
  {
    id: 'mall',
    name: 'Shopping Mall',
    type: 'mall',
    zones: [
      { id: 'entrance', name: 'Main Entrance', type: 'entrance' },
      { id: 'food-court', name: 'Food Court', type: 'facility' },
      { id: 'parking', name: 'Parking Area', type: 'facility' },
      { id: 'escalators', name: 'Escalators', type: 'transit' }
    ]
  },
  {
    id: 'stadium',
    name: 'Sports Stadium',
    type: 'stadium',
    zones: [
      { id: 'gate-a', name: 'Gate A', type: 'entrance' },
      { id: 'concourse', name: 'Concourse', type: 'facility' },
      { id: 'seating', name: 'Seating Area', type: 'seating' },
      { id: 'exit-gates', name: 'Exit Gates', type: 'exit' }
    ]
  }
];

const VenueContext = createContext<VenueContextType | undefined>(undefined);

export const VenueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedVenue, setSelectedVenue] = useState('airport');
  const [selectedZone, setSelectedZone] = useState('pre-screening');

  const getCurrentVenue = () => venues.find(v => v.id === selectedVenue);
  const getCurrentZone = () => getCurrentVenue()?.zones.find(z => z.id === selectedZone);

  return (
    <VenueContext.Provider value={{
      venues,
      selectedVenue,
      selectedZone,
      setSelectedVenue,
      setSelectedZone,
      getCurrentVenue,
      getCurrentZone
    }}>
      {children}
    </VenueContext.Provider>
  );
};

export const useVenue = () => {
  const context = useContext(VenueContext);
  if (!context) {
    throw new Error('useVenue must be used within VenueProvider');
  }
  return context;
};