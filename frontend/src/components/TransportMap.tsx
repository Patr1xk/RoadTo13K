import { motion, AnimatePresence } from "framer-motion";
import { Bus, Train, MapPin, Users, Clock } from "lucide-react";

interface Transport {
  id: string;
  type: string;
  name: string;
  lat: number;
  lng: number;
  status: string;
  capacity: number;
  schedules: string[];
}

interface TransportMapProps {
  transports: Transport[];
  onMarkerClick: (id: string) => void;
  selectedMarker: string | null;
}

// Helper for SVG map projection
const project = (lat: number, lng: number) => ({
  x: 400 + (lng + 74) * 800,
  y: 200 - (lat - 40.75) * 800,
});

export const TransportMap = ({
  transports,
  onMarkerClick,
  selectedMarker,
}: TransportMapProps) => {
  return (
    <div className="relative w-full h-[340px] bg-black/30 rounded-lg overflow-hidden">
      <svg width="100%" height="340" viewBox="0 0 800 340">
        {/* Venue and stop markers */}
        {[
          {
            id: "venue1",
            type: "venue",
            name: "MetLife Stadium",
            lat: 40.754,
            lng: -73.996,
          },
          {
            id: "stop1",
            type: "stop",
            name: "Bus Terminal",
            lat: 40.753,
            lng: -73.994,
          },
          {
            id: "stop2",
            type: "stop",
            name: "Train Station",
            lat: 40.752,
            lng: -73.998,
          },
        ].map((location) => {
          const { x, y } = project(location.lat, location.lng);
          return (
            <g key={location.id}>
              <motion.circle
                cx={x}
                cy={y}
                r={location.type === "venue" ? 16 : 8}
                fill={location.type === "venue" ? "#3b82f6" : "#fbbf24"}
                stroke="#fff"
                strokeWidth={2}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              />
              <text
                x={x + 20}
                y={y}
                fontSize={12}
                fill="#fff"
                style={{ fontWeight: "bold" }}
              >
                {location.name}
              </text>
            </g>
          );
        })}

        {/* Transport routes */}
        {transports.map((t) => {
          const start = project(t.lat, t.lng);
          const end = project(40.754, -73.996); // venue location
          return (
            <motion.line
              key={`route-${t.id}`}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={t.type === "bus" ? "#22d3ee" : "#a78bfa"}
              strokeWidth={3}
              strokeDasharray="4 4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
            />
          );
        })}

        {/* Animated transport markers */}
        {transports.map((t) => {
          const { x, y } = project(t.lat, t.lng);
          return (
            <motion.g
              key={t.id}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: [x - 20, x, x + 20, x],
                y: [y, y - 10, y + 10, y],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              onClick={() => onMarkerClick(t.id)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={x}
                cy={y}
                r={12}
                fill={t.type === "bus" ? "#22d3ee" : "#a78bfa"}
                stroke="#fff"
                strokeWidth={2}
              />
              <text
                x={x}
                y={y + 5}
                fontSize={14}
                fill="#fff"
                textAnchor="middle"
              >
                {t.type === "bus" ? "🚌" : "🚆"}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Info popup for selected marker */}
      <AnimatePresence>
        {selectedMarker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white p-4 rounded-lg shadow-lg"
          >
            {(() => {
              const t = transports.find((t) => t.id === selectedMarker);
              if (!t) return null;
              return (
                <div className="min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    {t.type === "bus" ? (
                      <Bus className="w-5 h-5" />
                    ) : (
                      <Train className="w-5 h-5" />
                    )}
                    <span className="font-semibold">{t.name}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>
                      Status: <span className="text-green-400">{t.status}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>Capacity: {t.capacity}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Next: {t.schedules[0]}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
