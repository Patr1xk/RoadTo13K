import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bus,
  Train,
  Car,
  MapPin,
  Users,
  Check,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { TransportMap } from "../components/TransportMap";

// Logical venues/zones for transport scheduling
const venues = [
  {
    id: "stadium-1",
    name: "MetLife Stadium",
    type: "stadium",
    location: "East Rutherford, NJ",
    crowd: 90000,
  },
  {
    id: "mall-1",
    name: "Westfield Mall",
    type: "mall",
    location: "White Plains, NY",
    crowd: 12000,
  },
  {
    id: "concert-1",
    name: "Central Park Concert",
    type: "concert",
    location: "NYC",
    crowd: 35000,
  },
  {
    id: "airport-1",
    name: "JFK Airport",
    type: "airport",
    location: "New York, NY",
    crowd: 5000,
  },
  {
    id: "carnival-1",
    name: "Summer Carnival",
    type: "carnival",
    location: "Brooklyn, NY",
    crowd: 8000,
  },
];

// Transport options associated with venues/zones
const initialTransports = [
  {
    id: "bus-1",
    mode: "bus",
    route: "Express B1",
    venueId: "stadium-1",
    status: "on-time",
    capacity: 60,
    location: "Gate 3",
    booked: false,
  },
  {
    id: "lrt-1",
    mode: "lrt",
    route: "Blue Line",
    venueId: "stadium-1",
    status: "delayed",
    capacity: 200,
    location: "Platform 1",
    booked: false,
  },
  {
    id: "bus-2",
    mode: "bus",
    route: "Mall Shuttle",
    venueId: "mall-1",
    status: "free",
    capacity: 40,
    location: "North Entrance",
    booked: false,
  },
  {
    id: "train-1",
    mode: "train",
    route: "Airport Express",
    venueId: "airport-1",
    status: "on-time",
    capacity: 300,
    location: "Terminal 4",
    booked: false,
  },
  {
    id: "taxi-1",
    mode: "taxi",
    route: "Taxi Stand",
    venueId: "concert-1",
    status: "free",
    capacity: 4,
    location: "South Gate",
    booked: false,
  },
  {
    id: "bus-3",
    mode: "bus",
    route: "Carnival Shuttle",
    venueId: "carnival-1",
    status: "booked",
    capacity: 50,
    location: "Main Exit",
    booked: true,
  },
];

const transportIcons: Record<string, JSX.Element> = {
  bus: <Bus className="w-5 h-5" />,
  lrt: <Train className="w-5 h-5" />,
  train: <Train className="w-5 h-5" />,
  taxi: <Car className="w-5 h-5" />,
};

const crowdThresholds: Record<string, number> = {
  stadium: 50000,
  mall: 10000,
  concert: 20000,
  airport: 3000,
  carnival: 5000,
};

// Sample transport data
const transportData = [
  {
    id: "bus1",
    type: "bus",
    name: "Express B1",
    lat: 40.753,
    lng: -73.994,
    status: "on-time",
    capacity: 60,
    schedules: ["10:00–10:30", "11:00–11:30"],
  },
  {
    id: "train1",
    type: "train",
    name: "Blue Line",
    lat: 40.752,
    lng: -73.998,
    status: "booked",
    capacity: 200,
    schedules: ["10:15–10:45", "11:30–12:00"],
  },
];

export const Schedule = () => {
  const [selectedVenueId, setSelectedVenueId] = useState<string>(venues[0].id);
  const [transports, setTransports] = useState(initialTransports);
  const [isBooking, setIsBooking] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  // Filter transports for selected venue
  const filteredTransports = transports.filter(
    (t) => t.venueId === selectedVenueId
  );

  // Venue info
  const venue = venues.find((v) => v.id === selectedVenueId);

  // Check if crowd exceeds threshold for venue type
  const crowdExceeds =
    venue && venue.crowd > (crowdThresholds[venue.type] ?? 0);

  // Handle booking/linking transport
  const handleBookTransport = async (id: string) => {
    setIsBooking(id);
    await new Promise((r) => setTimeout(r, 900));
    setTransports((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, booked: true, status: "booked" } : t
      )
    );
    setIsBooking(null);
    setShowConfirm(id);
    setTimeout(() => setShowConfirm(null), 1800);
  };

  // Handle map loading
  const handleShowMap = () => {
    setMapLoading(true);
    setShowMap(true);
    setTimeout(() => setMapLoading(false), 1200);
  };

  // Update MapPanel component
  const MapPanel = () => (
    <motion.div
      key="map"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CalendarDays className="w-5 h-5" /> Real-Time Transport Map
        </h2>
      </div>

      {/* Interactive Transport Map */}
      <TransportMap
        transports={transportData}
        selectedMarker={selectedMarker}
        onMarkerClick={setSelectedMarker}
      />

      {/* Scrollable schedule cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 overflow-x-auto"
      >
        <div className="flex gap-4 pb-2">
          {transportData.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="min-w-[240px] bg-white/5 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                {t.type === "bus" ? (
                  <Bus className="w-5 h-5" />
                ) : (
                  <Train className="w-5 h-5" />
                )}
                <span className="font-semibold text-white">{t.name}</span>
              </div>
              <div className="flex flex-col gap-2">
                {t.schedules.map((schedule, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm"
                  >
                    {schedule}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Venue selection panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <h1 className="text-3xl font-bold text-white">Transport Scheduler</h1>
        <motion.div layout className="flex gap-3">
          {venues.map((v) => (
            <motion.button
              key={v.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedVenueId(v.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2
                ${
                  selectedVenueId === v.id
                    ? "bg-primary-500 text-white"
                    : "bg-white/5 text-gray-400"
                }`}
            >
              <MapPin className="w-4 h-4" />
              {v.name}
              <Users className="w-4 h-4 ml-2" />
              <span className="text-xs">{v.crowd.toLocaleString()}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Crowd threshold alert and deploy transport */}
      {crowdExceeds && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-yellow-500/20 text-yellow-700 px-4 py-2 rounded-lg mb-2 flex items-center gap-2"
        >
          <Users className="w-5 h-5" />
          <span>
            Crowd exceeds safe threshold! Deploy additional transport for
            dispersal.
          </span>
        </motion.div>
      )}

      {/* Transport list */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence>
          {filteredTransports.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`glass-card p-6 relative border-2 ${
                t.booked ? "border-green-400" : "border-transparent"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {transportIcons[t.mode]}
                <span className="text-lg font-medium">{t.route}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <MapPin className="w-4 h-4" />
                <span>{t.location}</span>
                <Users className="w-4 h-4 ml-2" />
                <span>{t.capacity} capacity</span>
              </div>
              <div
                className={`mt-2 px-3 py-1 rounded-full text-sm inline-block
                  ${
                    t.status === "on-time"
                      ? "bg-green-500/20 text-green-400"
                      : t.status === "delayed"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : t.status === "booked"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
              >
                {t.status}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={t.booked || isBooking === t.id}
                onClick={() => handleBookTransport(t.id)}
                className={`mt-4 w-full px-4 py-2 rounded-lg font-semibold transition
                  ${
                    t.booked
                      ? "bg-green-500 text-white"
                      : isBooking === t.id
                      ? "bg-primary-500 text-white opacity-70"
                      : "bg-primary-500 text-white hover:bg-primary-600"
                  }`}
              >
                {t.booked ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Linked/Booked
                  </span>
                ) : isBooking === t.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Booking...
                  </span>
                ) : (
                  "Link/Book Transport"
                )}
              </motion.button>
              {/* Animated confirmation */}
              <AnimatePresence>
                {showConfirm === t.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-2 right-2 bg-green-500/90 text-white px-3 py-1 rounded shadow-lg flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Confirmed!
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredTransports.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center text-gray-400 py-8"
          >
            No transport options available for this venue/zone.
          </motion.div>
        )}
      </motion.div>

      {/* Real-time transport map (mocked) */}
      <div className="mt-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShowMap}
          className="px-6 py-2 rounded-lg bg-primary-500 text-white font-semibold"
        >
          View Real-Time Transport Map
        </motion.button>
        <AnimatePresence>
          {showMap && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="mt-4 glass-card p-6"
            >
              {mapLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-12"
                >
                  <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                </motion.div>
              ) : (
                <MapPanel />
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMap(false)}
                className="mt-6 px-4 py-2 rounded-lg bg-white/10 text-white font-semibold"
              >
                Close Map
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
