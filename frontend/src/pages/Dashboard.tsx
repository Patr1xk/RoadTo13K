import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { VenueCard } from "../components/VenueCard";

interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  recentSessions: number;
}

interface DashboardProps {
  venues: Venue[];
}

export const Dashboard = ({ venues }: DashboardProps) => {
  const [pinnedVenueId, setPinnedVenueId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePinToggle = async (venueId: string) => {
    if (pinnedVenueId === venueId) {
      setPinnedVenueId(null);
      return;
    }

    setIsLoading(true);
    setPinnedVenueId(venueId);

    // Simulate data loading
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>{isLoading && <LoadingSpinner />}</AnimatePresence>

      <motion.div layout>
        {pinnedVenueId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6 mb-6"
          >
            {/* Pinned venue details here */}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              isPinned={venue.id === pinnedVenueId}
              onPinToggle={handlePinToggle}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};
