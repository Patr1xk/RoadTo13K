import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FloorPlanUpload } from '../components/FloorPlanUpload';
import { ZoneConfiguration } from '../components/ZoneConfiguration';
import { LiveHeatmapDashboard } from '../components/LiveHeatmapDashboard';
import { FloorPlan, Zone } from '../types';

type SetupStep = 'upload' | 'configure' | 'dashboard';

export const FloorPlanSetup: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<SetupStep>('upload');
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<FloorPlan | null>(null);
  const [configuredZones, setConfiguredZones] = useState<Zone[]>([]);

  const handleFloorPlanSelect = (floorPlan: FloorPlan) => {
    setSelectedFloorPlan(floorPlan);
    setCurrentStep('configure');
  };

  const handleZonesConfigured = (zones: Zone[]) => {
    setConfiguredZones(zones);
    setCurrentStep('dashboard');
  };

  const handleBackToUpload = () => {
    setCurrentStep('upload');
    setSelectedFloorPlan(null);
  };

  const handleBackToConfigure = () => {
    setCurrentStep('configure');
  };

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const getStepDirection = (from: SetupStep, to: SetupStep) => {
    const steps = ['upload', 'configure', 'dashboard'];
    return steps.indexOf(to) - steps.indexOf(from);
  };

  return (
    <div className="min-h-screen">
      {/* Progress indicator */}
      <motion.div 
        className="glass-card mb-8 p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between max-w-md mx-auto">
          {[
            { step: 'upload', label: 'Floor Plan', number: 1 },
            { step: 'configure', label: 'Configure Zones', number: 2 },
            { step: 'dashboard', label: 'Live Dashboard', number: 3 }
          ].map((item, index) => (
            <div key={item.step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                ${currentStep === item.step || (index < ['upload', 'configure', 'dashboard'].indexOf(currentStep))
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-600 text-gray-300'
                }
              `}>
                {item.number}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === item.step ? 'text-white' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
              {index < 2 && (
                <div className={`w-8 h-0.5 mx-4 transition-colors duration-300 ${
                  index < ['upload', 'configure', 'dashboard'].indexOf(currentStep)
                    ? 'bg-primary-500' 
                    : 'bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Step content */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={getStepDirection('upload', currentStep)}>
          {currentStep === 'upload' && (
            <motion.div
              key="upload"
              custom={getStepDirection('upload', currentStep)}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
            >
              <FloorPlanUpload onFloorPlanSelect={handleFloorPlanSelect} />
            </motion.div>
          )}

          {currentStep === 'configure' && selectedFloorPlan && (
            <motion.div
              key="configure"
              custom={getStepDirection('configure', currentStep)}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
            >
              <ZoneConfiguration
                floorPlan={selectedFloorPlan}
                onZonesConfigured={handleZonesConfigured}
                onBack={handleBackToUpload}
              />
            </motion.div>
          )}

          {currentStep === 'dashboard' && selectedFloorPlan && configuredZones.length > 0 && (
            <motion.div
              key="dashboard"
              custom={getStepDirection('dashboard', currentStep)}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
            >
              <LiveHeatmapDashboard
                floorPlan={selectedFloorPlan}
                zones={configuredZones}
                onBack={handleBackToConfigure}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};