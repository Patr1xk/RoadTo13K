import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, X } from 'lucide-react';

interface NotificationStatusProps {
  isVisible: boolean;
  status: 'sending' | 'success' | 'error';
  message: string;
  onClose: () => void;
}

export const NotificationStatus: React.FC<NotificationStatusProps> = ({
  isVisible,
  status,
  message,
  onClose
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'sending':
        return {
          icon: <Clock className="w-5 h-5" />,
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-300'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500',
          textColor: 'text-green-300'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500',
          textColor: 'text-red-300'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className={`glass-card p-4 border-l-4 ${config.bgColor} ${config.borderColor} min-w-80 max-w-md`}>
            <div className="flex items-start gap-3">
              <div className={config.textColor}>
                {config.icon}
              </div>
              
              <div className="flex-1">
                <h4 className={`font-semibold ${config.textColor} mb-1`}>
                  {status === 'sending' ? 'Sending Notification...' :
                   status === 'success' ? 'Notification Sent' :
                   'Notification Failed'}
                </h4>
                <p className="text-sm text-gray-300">{message}</p>
              </div>
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {status === 'sending' && (
              <div className="mt-3">
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <motion.div
                    className="bg-blue-500 h-1 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};