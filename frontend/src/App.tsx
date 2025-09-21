import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import { Navigation } from "./components/Navigation";
import { FloorPlanSetup } from "./pages/FloorPlanSetup";
import { LiveSimulation } from "./pages/LiveSimulation";
import { SimulationAnalytics } from "./pages/SimulationAnalytics";
import { VenueSelection } from "./pages/VenueSelection";
import { VenueDashboard } from "./pages/VenueDashboard";
import { SessionDetail } from "./pages/SessionDetail";
import { NotificationsCrew } from "./pages/NotificationsCrew";
import { NotificationsPage } from "./pages/NotificationsPage";
import { AIPredictionsPage } from "./pages/AIPredictionsPage";
import { SecurityFlowPage } from "./pages/SecurityFlowPage";
import { SchedulePlanning } from "./pages/SchedulePlanning";
import { Schedule } from "./pages/Schedule";
import "./styles/heatmap.css";

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <Navigation />

        <motion.main
          className="container mx-auto px-6 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/analytics" replace />} />
            <Route path="/venues" element={<VenueSelection />} />
            <Route path="/simulation" element={<LiveSimulation />} />
            <Route path="/analytics" element={<VenueDashboard />} />
            <Route path="/analytics-direct" element={<SimulationAnalytics />} />
            <Route path="/session/:sessionId" element={<SessionDetail />} />
            <Route path="/floorplan" element={<FloorPlanSetup />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/crew" element={<NotificationsCrew />} />
            <Route path="/ai" element={<AIPredictionsPage />} />
            <Route path="/security-flow" element={<SecurityFlowPage />} />
            <Route path="/schedule" element={<Schedule />} />
          </Routes>
        </motion.main>

        {/* Background decoration */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>
      </div>
    </Router>
  );
};
