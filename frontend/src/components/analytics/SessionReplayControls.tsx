import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Settings } from 'lucide-react';

interface SessionReplayControlsProps {
  /** Current playback time in seconds */
  currentTime: number;
  /** Total session duration in seconds */
  totalTime: number;
  /** Whether playback is active */
  isPlaying: boolean;
  /** Playback speed multiplier */
  playbackSpeed: number;
  /** Available playback speeds */
  speedOptions: number[];
  /** Callback when play/pause is toggled */
  onPlayPause: () => void;
  /** Callback when time position changes */
  onTimeChange: (time: number) => void;
  /** Callback when playback speed changes */
  onSpeedChange: (speed: number) => void;
  /** Callback to reset to beginning */
  onReset: () => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Interactive playback controls for session replay
 * Provides timeline scrubbing, speed control, and playback management
 */
export const SessionReplayControls: React.FC<SessionReplayControlsProps> = ({
  currentTime,
  totalTime,
  isPlaying,
  playbackSpeed,
  speedOptions,
  onPlayPause,
  onTimeChange,
  onSpeedChange,
  onReset,
  isLoading = false
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = totalTime > 0 ? (currentTime / totalTime) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="space-y-4">
        {/* Timeline slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Session Replay</span>
            <span>{formatTime(currentTime)} / {formatTime(totalTime)}</span>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min={0}
              max={totalTime}
              value={currentTime}
              onChange={(e) => onTimeChange(parseInt(e.target.value))}
              disabled={isLoading}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
            />
            
            {/* Progress indicator */}
            <div 
              className="absolute top-0 left-0 h-2 bg-primary-500 rounded-lg pointer-events-none transition-all duration-200"
              style={{ width: `${progressPercentage}%` }}
            />
            
            {/* Time markers */}
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0:00</span>
              <span className="text-primary-400 font-medium">
                {Math.round(progressPercentage)}%
              </span>
              <span>{formatTime(totalTime)}</span>
            </div>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Reset button */}
            <button
              onClick={onReset}
              disabled={isLoading}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50"
              title="Reset to beginning"
            >
              <RotateCcw className="w-4 h-4 text-white" />
            </button>
            
            {/* Skip backward */}
            <button
              onClick={() => onTimeChange(Math.max(0, currentTime - 30))}
              disabled={isLoading}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50"
              title="Skip back 30s"
            >
              <SkipBack className="w-4 h-4 text-white" />
            </button>
            
            {/* Play/Pause */}
            <motion.button
              onClick={onPlayPause}
              disabled={isLoading}
              className="p-3 rounded-lg bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white" />
              )}
            </motion.button>
            
            {/* Skip forward */}
            <button
              onClick={() => onTimeChange(Math.min(totalTime, currentTime + 30))}
              disabled={isLoading}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50"
              title="Skip forward 30s"
            >
              <SkipForward className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Playback speed control */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Settings className="w-4 h-4" />
              <span>Speed:</span>
            </div>
            
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              {speedOptions.map(speed => (
                <button
                  key={speed}
                  onClick={() => onSpeedChange(speed)}
                  disabled={isLoading}
                  className={`
                    px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50
                    ${playbackSpeed === speed
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
              <span>{isPlaying ? 'Playing' : 'Paused'}</span>
            </div>
            
            {playbackSpeed !== 1 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>{playbackSpeed}x Speed</span>
              </div>
            )}
          </div>
          
          <div>
            Remaining: {formatTime(totalTime - currentTime)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};