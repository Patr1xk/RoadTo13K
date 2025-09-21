# 🇲🇾 AI Prediction Dashboard

A sophisticated, animated React dashboard for Malaysian crowd control predictions using live AWS API endpoints.

## ✨ Features

### 🏛️ Interactive Venue Selection
- **4 Malaysian Venues**: Stadium, Mall, Airport, Concert Hall
- **Smooth Animations**: Fade/slide transitions between selections
- **Real Malaysian Locations**: KLCC, Bukit Jalil, KLIA, Axiata Arena

### 🎛️ Prediction Controls
- **Live API Integration**: 
  - `POST /run-demo` - Complete AI demonstration
  - `GET /evaluation` - Performance metrics
- **Animated Loading States**: Spinning progress indicators
- **Error Handling**: User-friendly error messages
- **Quick Actions**: Run both endpoints with one click

### ⚙️ User Input Controls
- **Time Horizon Slider**: 5-120 minutes with smooth animations
- **Confidence Threshold**: 50-95% with visual feedback
- **Overlay Opacity**: 10-100% real-time preview
- **Alert Level Toggles**: Low/Medium/High with color coding
- **Advanced Settings**: Expandable options panel

### 📊 Dynamic Prediction Display
- **Tabbed Interface**: Demo Results, Performance Metrics, Live Heatmap
- **Smooth Transitions**: Content slides in/out with animations
- **Real-time Heatmaps**: Zone-based crowd visualization
- **Cultural Insights**: Malaysian-specific AI recommendations
- **Performance Comparisons**: Traditional ML vs SageMaker AI

## 🔌 API Integration

### Live Endpoints
```typescript
const API_BASE = 'https://91tci351oe.execute-api.us-east-1.amazonaws.com/prod';

// Run complete demo for all 3 scenarios
POST ${API_BASE}/run-demo
Headers: { 'Content-Type': 'application/json' }

// Get system performance metrics
GET ${API_BASE}/evaluation
```

### Response Handling
- ✅ **Success States**: Data display with animations
- ❌ **Error States**: User-friendly error messages
- ⏳ **Loading States**: Animated spinners and progress bars
- 🔄 **Auto-refresh**: Optional real-time updates

## 🎨 UX & Design

### Animations & Transitions
- **Framer Motion**: Smooth component transitions
- **Hover Effects**: Scale, glow, and shadow animations
- **Loading Spinners**: Rotating progress indicators
- **Status Indicators**: Pulsing connection dots
- **Gradient Backgrounds**: Animated color shifts

### Responsive Design
- **Mobile-first**: Works on all screen sizes
- **Grid Layouts**: Adaptive column counts
- **Touch-friendly**: Large tap targets
- **Accessibility**: Focus states and ARIA labels

### Visual Polish
- **Glass Morphism**: Backdrop blur effects
- **Custom Sliders**: Gradient-styled range inputs
- **Status Colors**: Green/Yellow/Red risk levels
- **Live Previews**: Real-time setting feedback

## 🏗️ Architecture

### Component Structure
```
AIPredictionDashboard/
├── VenueSelector          # Animated venue picker
├── PredictionControls     # API integration buttons
├── UserInputControls      # Settings & configuration
└── PredictionDisplay      # Results visualization
    ├── Demo Results Tab   # AI scenario analysis
    ├── Metrics Tab        # Performance data
    └── Heatmap Tab        # Live visualization
```

### State Management
```typescript
interface PredictionSettings {
  timeHorizon: number;
  confidenceThreshold: number;
  overlayOpacity: number;
  alertLevel: 'low' | 'medium' | 'high';
}
```

## 🚀 Usage

### In React App
```tsx
import AIPredictionDashboard from './components/AIPredictionDashboard';

function App() {
  return <AIPredictionDashboard />;
}
```

### Navigation Integration
```tsx
// Already integrated in frontend/src/App.tsx
<Route path="/ai" element={<AIPredictionsPage />} />
```

### Development Server
```bash
cd frontend
npm start
# Navigate to http://localhost:3000/ai
```

## 🌟 Demo Workflow

1. **Select Venue** → Choose from 4 Malaysian locations
2. **Configure Settings** → Adjust time horizon, confidence, opacity
3. **Run Demo** → Execute live API call to AWS Lambda
4. **View Results** → Explore 3 tabs of prediction data
5. **Interactive Heatmap** → Real-time crowd visualization

## 📱 Mobile Experience

- **Touch Optimized**: Large buttons and touch targets
- **Swipe Navigation**: Smooth tab transitions
- **Responsive Grid**: Adaptive layouts for all screens
- **Performance**: Optimized animations for mobile devices

## 🔧 Customization

### Styling
- **CSS Variables**: Easy color theme changes
- **Tailwind Classes**: Utility-first styling
- **Custom CSS**: Enhanced animations in `ai-dashboard.css`

### Configuration
- **API Endpoints**: Easily configurable base URLs
- **Venues**: Add new Malaysian locations
- **Settings**: Extend user controls and options

## 🎯 Integration Ready

Perfect for:
- ✅ **Hackathon Demonstrations**
- ✅ **Client Presentations** 
- ✅ **Live API Testing**
- ✅ **Interactive Dashboards**
- ✅ **Malaysian Crowd Control Systems**

Built with modern React, TypeScript, Framer Motion, and Tailwind CSS for maximum developer experience and user delight! 🚀