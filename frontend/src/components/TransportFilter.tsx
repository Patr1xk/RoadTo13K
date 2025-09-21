import { motion } from "framer-motion";
import { TransportMode } from "../types/schedule";

interface TransportFilterProps {
  selectedModes: TransportMode[];
  onModeToggle: (mode: TransportMode) => void;
}

export const TransportFilter = ({
  selectedModes,
  onModeToggle,
}: TransportFilterProps) => {
  const modes: TransportMode[] = ["bus", "lrt", "train", "shuttle"];

  return (
    <motion.div layout className="flex gap-2 mb-4">
      {modes.map((mode) => (
        <motion.button
          key={mode}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onModeToggle(mode)}
          className={`px-4 py-2 rounded-lg capitalize
            ${
              selectedModes.includes(mode)
                ? "bg-primary-500 text-white"
                : "bg-white/5 text-gray-400"
            }`}
        >
          {mode}
        </motion.button>
      ))}
    </motion.div>
  );
};
