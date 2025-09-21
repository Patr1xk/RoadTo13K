import { motion } from "framer-motion";
import { Clock, Bus, Train } from "lucide-react";
import { TransportSchedule } from "../types/schedule";

interface ScheduleTimelineProps {
  schedules: TransportSchedule[];
  onScheduleSelect: (schedule: TransportSchedule) => void;
}

export const ScheduleTimeline = ({
  schedules,
  onScheduleSelect,
}: ScheduleTimelineProps) => {
  return (
    <motion.div layout className="glass-card p-6 overflow-x-auto">
      <div className="flex space-x-4 min-w-[800px]">
        {schedules.map((schedule) => (
          <motion.div
            key={schedule.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onScheduleSelect(schedule)}
            className="flex-1 p-4 bg-white/5 rounded-lg cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              {schedule.mode === "bus" ? (
                <Bus className="w-4 h-4" />
              ) : (
                <Train className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{schedule.route}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{schedule.departureTime}</span>
            </div>
            <div
              className={`text-xs mt-2 px-2 py-1 rounded-full inline-block
              ${
                schedule.status === "on-time"
                  ? "bg-green-500/20 text-green-400"
                  : schedule.status === "delayed"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {schedule.status}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
