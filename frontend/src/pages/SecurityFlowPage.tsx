import React from 'react';
import { motion } from 'framer-motion';
import { SecurityQueueFlowWithImage } from '../components/SecurityQueueFlowWithImage';

export const SecurityFlowPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Security Queue Flow</h1>
        <p className="text-gray-400 text-lg">Interactive monitoring and analytics for security checkpoints</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SecurityQueueFlowWithImage width={900} height={600} />
      </motion.div>

      {/* Additional Analytics Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4">Queue Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Average Wait Time</span>
              <span className="text-white font-semibold">3.2 minutes</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total Throughput</span>
              <span className="text-white font-semibold">205 people/hour</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Peak Capacity</span>
              <span className="text-white font-semibold">85% utilized</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Bottleneck Point</span>
              <span className="text-red-400 font-semibold">Security Scan</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4">Real-time Alerts</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <div>
                <div className="text-red-300 font-medium text-sm">Critical Queue Length</div>
                <div className="text-gray-400 text-xs">Security Scan checkpoint exceeding capacity</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <div>
                <div className="text-yellow-300 font-medium text-sm">Extended Wait Time</div>
                <div className="text-gray-400 text-xs">Document Check averaging 4.2 minutes</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div>
                <div className="text-green-300 font-medium text-sm">Optimal Flow</div>
                <div className="text-gray-400 text-xs">Entry and Exit points operating normally</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};