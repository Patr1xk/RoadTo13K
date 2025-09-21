export interface Venue {
  id: string;
  name: string;
  type: string;
  location: string;
  capacity: number;
  description: string;
  features: string[];
  recentSessions: number;
  status: string;
}
