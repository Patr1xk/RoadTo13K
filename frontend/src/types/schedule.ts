export type TransportMode = 'bus' | 'lrt' | 'train' | 'shuttle';

export interface TransportSchedule {
  id: string;
  mode: TransportMode;
  route: string;
  departureTime: string;
  arrivalTime: string;
  capacity: number;
  status: 'on-time' | 'delayed' | 'cancelled';
}

export interface VenueSchedule {
  venueId: string;
  eventId?: string;
  transportSchedules: TransportSchedule[];
  peakHours: {
    start: string;
    end: string;
  }[];
}
