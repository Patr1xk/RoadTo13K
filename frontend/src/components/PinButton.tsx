import { motion } from "framer-motion";
import { Pin } from "lucide-react";

interface PinButtonProps {
  isPinned: boolean;
  onClick: () => void;
}

export const PinButton = ({ isPinned, onClick }: PinButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="absolute top-2 right-2 p-2 rounded-full bg-white/10 hover:bg-white/20"
      title={isPinned ? "Unpin from dashboard" : "Pin to dashboard"}
    >
      <Pin size={20} className={isPinned ? "fill-current" : ""} />
    </motion.button>
  );
};
