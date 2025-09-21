import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface TimeSliderProps {
  currentTime: number;
  maxTime: number;
  isPlaying: boolean;
  onTimeChange: (time: number) => void;
  onPlayPause: () => void;
  onReset: () => void;
  timeUnit: 'second' | 'minute' | 'hour';
  onTimeUnitChange: (unit: 'second' | 'minute' | 'hour') => void;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({
  currentTime,
  maxTime,
  isPlaying,
  onTimeChange,
  onPlayPause,
  onReset,
  timeUnit,
  onTimeUnitChange
}) => {
  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    
    if (timeUnit === 'hour') return `${hours}h`;
    if (timeUnit === 'minute') return `${hours}:${minutes.toString().padStart(2, '0')}`;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <SkipBack className="w-4 h-4 text-white" />
          </button>
          
          <button
            onClick={onPlayPause}
            className="p-2 rounded-lg bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white" />
            )}
          </button>
        </div>

        {/* Time Slider */}
        <div className="flex-1 px-4">
          <div className="relative">
            <input
              type="range"
              min={0}
              max={maxTime}
              value={currentTime}
              onChange={(e) => onTimeChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(0)}</span>
              <span className="text-white font-medium">{formatTime(currentTime)}</span>
              <span>{formatTime(maxTime)}</span>
            </div>
          </div>
        </div>

        {/* Time Unit Selector */}
        <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
          {(['second', 'minute', 'hour'] as const).map((unit) => (
            <button
              key={unit}
              onClick={() => onTimeUnitChange(unit)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                timeUnit === unit
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>


    </motion.div>
  );
};