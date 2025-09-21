# Crowd Management System

A modern, multi-page TypeScript React application for comprehensive crowd simulation and management with real-time heatmap visualization.

## Features

### 🎯 Live Simulation
- Real-time heatmap visualization with D3.js
- Interactive scenario switching (Entry Rush, Facilities, Evacuation, Half-Time)
- What-if scenario toggles for instant impact analysis
- Hover tooltips with detailed crowd density information

### 📱 Notifications & Crew Panel
- WhatsApp/Amazon SNS notification system with mock APIs
- Two-way crew communication with activity feed
- Quick message templates for common instructions
- Real-time feedback approval/denial system

### 🤖 AI Prediction
- Predictive crowd density visualization
- Risk zone alerts with confidence levels
- Configurable time horizon (5min to 1 hour)
- Color-coded prediction zones

### 📅 Schedule & Planning
- Event timeline with transport integration
- Bus/LRT schedule optimization
- Crowd flow predictions with optimal exit windows
- Risk period identification

### ⚙️ Stadium Setup & Training
- Interactive floor plan editor with drag-drop
- Configurable area types (entrances, exits, facilities, seating)
- AI training mode simulation
- Visual area management tools

## Quick Start

```bash
npm install
npm start
```

## Architecture

- **Multi-page React Router navigation**
- **Responsive grid layouts** (desktop/tablet/mobile)
- **Reusable component library** with consistent styling
- **Mock API integrations** for AWS services
- **Interactive tooltips and hover effects**
- **Real-time data simulation** with scenario-based generation

## Navigation

- `/venues` - **NEW** Venue selection landing page with animated cards
- `/simulation` - Live crowd heatmap with scenario controls
- `/analytics` - **CONSOLIDATED** Analytics & Venue Overview with integrated venue data and analytics
- `/notifications` - Crew communication and notification center  
- `/ai` - AI predictions and risk analysis
- `/schedule` - Event planning and transport optimization
- `/setup` - Stadium configuration and training tools

## New Features

### 🎯 Interactive Filtering System
- **Sticky filter bar** that follows you as you scroll
- **Real-time search** across sessions, locations, and scenarios
- **Animated filter tags** with smooth transitions
- **Range selection** for dates and times
- **Visual feedback** showing filtered results count

### 🏢 Consolidated Analytics & Venue Overview
- **Unified page design** combining venue information with analytics data
- **Single clear heading** eliminating redundant "Venue" and "Analytics" titles
- **Integrated venue context** with comprehensive analytics in one view
- **Streamlined navigation** reducing confusion between separate sections
- **Preserved functionality** maintaining all filters, charts, and interactive elements

## Technology Stack

- **React 18** with TypeScript
- **React Router** for multi-page navigation
- **Framer Motion** for smooth animations and transitions
- **D3.js** for data visualization
- **Tailwind CSS** with custom components
- **CSS Grid & Flexbox** for responsive layouts
- **Mock APIs** simulating AWS SNS, WhatsApp, and SageMaker