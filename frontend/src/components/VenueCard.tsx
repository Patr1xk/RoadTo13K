import { motion } from "framer-motion";
import { PinButton } from "./PinButton";
import { MapPin, Users, Calendar } from "lucide-react";

interface VenueCardProps {
  venue: {
    id: string;
    name: string;
    location: string;
    capacity: number;
    recentSessions: number;
  };
  isPinned: boolean;
  onPinToggle: (venueId: string) => void;
}

export const VenueCard = ({ venue, isPinned, onPinToggle }: VenueCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative glass-card p-6"
    >
      <PinButton isPinned={isPinned} onClick={() => onPinToggle(venue.id)} />
      <h3 className="text-xl font-bold text-white">{venue.name}</h3>
      <div className="flex items-center gap-4 text-gray-400 mt-2">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {venue.location}
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {venue.capacity.toLocaleString()}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {venue.recentSessions} sessions
        </div>
      </div>
    </motion.div>
  );
};
