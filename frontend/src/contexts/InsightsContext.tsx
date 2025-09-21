import React, { createContext, useContext, useState, useCallback } from 'react';
import { RecommendationInsight } from '../types';

interface InsightsContextType {
  insights: RecommendationInsight[];
  addInsight: (insight: RecommendationInsight) => void;
  removeInsight: (id: string) => void;
  clearResolvedInsights: (activeZones: string[]) => void;
}

const InsightsContext = createContext<InsightsContextType | undefined>(undefined);

export const InsightsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [insights, setInsights] = useState<RecommendationInsight[]>([]);

  const addInsight = useCallback((newInsight: RecommendationInsight) => {
    setInsights(prev => {
      // Check if similar insight already exists
      const exists = prev.some(insight => 
        insight.affectedZones[0] === newInsight.affectedZones[0] &&
        insight.type === newInsight.type
      );
      
      if (exists) return prev;
      
      // Add new insight and limit to 5 most recent
      return [...prev, newInsight].slice(-5);
    });
  }, []);

  const removeInsight = useCallback((id: string) => {
    setInsights(prev => prev.filter(insight => insight.id !== id));
  }, []);

  const clearResolvedInsights = useCallback((activeZones: string[]) => {
    setInsights(prev => prev.filter(insight => 
      activeZones.includes(insight.affectedZones[0])
    ));
  }, []);

  return (
    <InsightsContext.Provider value={{ insights, addInsight, removeInsight, clearResolvedInsights }}>
      {children}
    </InsightsContext.Provider>
  );
};

export const useInsights = () => {
  const context = useContext(InsightsContext);
  if (!context) {
    throw new Error('useInsights must be used within InsightsProvider');
  }
  return context;
};