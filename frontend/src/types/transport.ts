export interface Transport {
  id: string;
  mode: string;
  name: string;
  route: string;
  venueId: string;
  status: string;
  capacity: number;
  currentLoad: number;
  location: string;
  booked: boolean;
  schedule: Array<{
    time: string;
    status: 'available' | 'booked' | 'delayed';
  }>;
}

export {};
