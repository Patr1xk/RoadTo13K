import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  Activity,
  TrendingUp,
  Pin,
} from "lucide-react";
import { SimulationAnalytics } from "./SimulationAnalytics";
import { VenueSelection } from "./VenueSelection";

interface VenueData {
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

export const VenueDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [venueData, setVenueData] = useState<VenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pinnedVenueId, setPinnedVenueId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Get venue data from navigation state or URL params
    const venueFromState = location.state?.venue;
    const venueIdFromParams = searchParams.get("venue");

    if (venueFromState) {
      setVenueData(venueFromState);
      setIsLoading(false);
    } else if (venueIdFromParams) {
      // Mock venue data fetch based on ID
      const mockVenueData = {
        id: venueIdFromParams,
        name: "MetLife Stadium",
        type: "stadium",
        location: "East Rutherford, NJ",
        capacity: 82500,
        description:
          "Premier sports venue with advanced crowd management systems",
        features: [
          "Multi-level seating",
          "VIP areas",
          "Food courts",
          "Emergency exits",
        ],
        recentSessions: 15,
        status: "active",
      };
      setVenueData(mockVenueData);
      setIsLoading(false);
    } else {
      // Show venue selection within the analytics page
      setVenueData(null);
      setIsLoading(false);
    }
  }, [location.state, searchParams, navigate]);

  const handleBackToVenues = () => {
    navigate("/venues", {
      state: { transition: "back-from-dashboard" },
    });
  };

  const handlePinVenue = async (venueId: string) => {
    if (pinnedVenueId === venueId) return;

    setIsTransitioning(true);
    setPinnedVenueId(venueId);

    // Simulate data loading
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update venue data
    const mockVenueData = {
      id: venueId,
      name:
        venueId === "stadium-1"
          ? "MetLife Stadium"
          : venueId === "arena-1"
          ? "Madison Square Garden"
          : "Westfield Mall",
      type:
        venueId === "stadium-1"
          ? "stadium"
          : venueId === "arena-1"
          ? "arena"
          : "mall",
      location:
        venueId === "stadium-1"
          ? "East Rutherford, NJ"
          : venueId === "arena-1"
          ? "New York, NY"
          : "White Plains, NY",
      capacity:
        venueId === "stadium-1" ? 82500 : venueId === "arena-1" ? 20789 : 15000,
      description: "Premier venue with advanced crowd management systems",
      features: [
        "Multi-level seating",
        "VIP areas",
        "Food courts",
        "Emergency exits",
      ],
      recentSessions: Math.floor(Math.random() * 20) + 10,
      status: "active",
    };

    setVenueData(mockVenueData);
    setIsTransitioning(false);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 mb-8"
          >
            <h1 className="text-4xl font-bold text-white">
              Analytics & Venue Overview
            </h1>
            <p className="text-gray-400 text-lg">
              Select a venue to access detailed analytics and management tools
            </p>
          </motion.div>
          <VenueSelection
            pinnedVenueId={pinnedVenueId ?? undefined}
            onPinVenue={handlePinVenue}
          />
        </>
      </motion.div>
    );
  }

  const getVenueIcon = (type: string) => {
    switch (type) {
      case "stadium":
        return "🏟️";
      case "arena":
        return "🎪";
      case "mall":
        return "🏬";
      case "conference":
        return "🏢";
      case "airport":
        return "✈️";
      default:
        return "🏢";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Loading Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-card p-8 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-bold text-white mb-2">
                Switching Venue
              </h3>
              <p className="text-gray-400">Loading analytics data...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Venue Header */}
      <motion.div
        key={venueData?.id}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-card p-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <motion.button
              onClick={handleBackToVenues}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </motion.button>

            <div className="flex items-center gap-4">
              <div className="text-4xl">
                {getVenueIcon(venueData?.type ?? "")}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Analytics & Venue Overview
                </h1>
                <p className="text-xl text-primary-300 font-medium">
                  {venueData?.name}
                </p>
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {venueData?.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {venueData?.capacity.toLocaleString()} capacity
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {venueData?.recentSessions} recent sessions
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {pinnedVenueId === venueData?.id && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium flex items-center gap-1"
              >
                <Pin className="w-3 h-3 fill-current" />
                Pinned
              </motion.div>
            )}
            <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
              {venueData?.status}
            </div>
            <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium capitalize">
              {venueData?.type}
            </div>
          </div>
        </div>

        <p className="text-gray-300 mt-4 max-w-2xl">{venueData?.description}</p>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <motion.div
            className="bg-white/5 rounded-lg p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <Activity className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">Live</div>
            <div className="text-sm text-gray-400">Status</div>
          </motion.div>

          <motion.div
            className="bg-white/5 rounded-lg p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">2,847</div>
            <div className="text-sm text-gray-400">Current Occupancy</div>
          </motion.div>

          <motion.div
            className="bg-white/5 rounded-lg p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <TrendingUp className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">73%</div>
            <div className="text-sm text-gray-400">Utilization Rate</div>
          </motion.div>

          <motion.div
            className="bg-white/5 rounded-lg p-4 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {venueData?.recentSessions}
            </div>
            <div className="text-sm text-gray-400">Sessions This Month</div>
          </motion.div>
        </div>

        {/* Features */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            Venue Features
          </h3>
          <div className="flex flex-wrap gap-2">
            {venueData?.features.map((feature, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm"
              >
                {feature}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Integrated Analytics Content */}
      <motion.div
        key={`analytics-${venueData?.id}`}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
      >
        <SimulationAnalytics hideHeader={true} />
      </motion.div>
    </motion.div>
  );
};
