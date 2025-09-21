export interface CrowdData {
  x: number;
  y: number;
  density: number;
  area: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
}

export interface AreaStats {
  area: string;
  people: number;
  congestionTime: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface AIRecommendation {
  id: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  approved?: boolean;
}

export interface FloorPlan {
  id: string;
  name: string;
  type: 'template' | 'uploaded';
  imageUrl: string;
  width: number;
  height: number;
}

export interface Zone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'entrance' | 'exit' | 'seating' | 'concourse' | 'facility';
  color: string;
}

export interface ZoneStats {
  zoneId: string;
  zoneName: string;
  occupancy: number;
  capacity: number;
  trafficFlow: number;
  dwellTime: number;
  busynessLevel: 'not-busy' | 'little-busy' | 'very-busy';
  trend: 'up' | 'down' | 'stable';
  heatmap?: ZoneHeatmap;
  recommendations?: TrafficRecommendation[];
  utilizationRate?: number;
}

export interface SimulationSession {
  id: string;
  name: string;
  date: Date;
  duration: number;
  scenario: string;
  totalVisitors: number;
  avgDuration: number;
  peakTime: string;
  location: string;
  floorplan: string;
  previewImage: string;
  maxOccupancy: number;
  zones: Zone[];
}

export interface TimeDistribution {
  notBusy: number;
  littleBusy: number;
  veryBusy: number;
}

export interface SummaryMetrics {
  engagedCustomers: number;
  averageDuration: number;
  trafficTrend: number;
  totalVisitors: number;
}

// Enhanced analytics types
export interface OccupancyTrendData {
  timestamp: Date;
  zoneId: string;
  zoneName: string;
  occupancy: number;
  capacity: number;
  utilizationRate: number;
  predicted?: number; // Optional predicted occupancy
  confidence?: number; // Prediction confidence level
}

export interface BusynessInterval {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export interface ZoneTypeDistribution {
  type: Zone['type'];
  label: string;
  totalCapacity: number;
  avgOccupancy: number;
  peakOccupancy: number;
  utilizationRate: number;
  color: string;
}

export interface AnalyticsFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  timeRange: {
    start: string;
    end: string;
  };
  zoneTypes: Zone['type'][];
  selectedZones: string[];
}

export interface InteractionCallbacks {
  onZoneHighlight: (zoneId: string | null) => void;
  onZoneSelect: (zoneId: string) => void;
  onTimeRangeChange: (start: Date, end: Date) => void;
}

export interface ChartDataPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
  metadata?: Record<string, any>;
}

// Enhanced chart types
export interface ChartSeries {
  id: string;
  name: string;
  data: ChartDataPoint[];
  color: string;
  type: 'actual' | 'predicted';
  style: 'solid' | 'dashed' | 'dotted';
  visible: boolean;
}

export interface ChartTooltipData {
  timestamp: Date;
  actual?: number;
  predicted?: number;
  delta?: number;
  zoneName: string;
  confidence?: number;
}

export interface ChartViewMode {
  mode: 'actual' | 'predicted' | 'comparison';
  showDelta: boolean;
  highlightDifferences: boolean;
}

// Heatmap and recommendation types
export interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number; // 0-1 scale
  timestamp: Date;
}

export interface ZoneHeatmap {
  zoneId: string;
  points: HeatmapPoint[];
  maxIntensity: number;
  lastUpdated: Date;
}

export interface TrafficRecommendation {
  id: string;
  zoneId: string;
  zoneName: string;
  type: 'high-density' | 'bottleneck' | 'evacuation' | 'flow-optimization';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actionRequired: string;
  timestamp: Date;
  status: 'pending' | 'sent' | 'acknowledged' | 'resolved';
  crewFeedback?: CrewFeedback;
  showInZone?: boolean;
}

export interface CrewFeedback {
  id: string;
  recommendationId: string;
  crewMemberId: string;
  crewName: string;
  response: 'accepted' | 'rejected' | 'modified';
  message: string;
  timestamp: Date;
  actionTaken?: string;
}

export interface NotificationPayload {
  recipientType: 'crew' | 'management' | 'security';
  recipients: string[];
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  zoneId?: string;
  recommendationId?: string;
  attachments?: string[];
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: 'online' | 'offline' | 'busy';
  assignedZones: string[];
  lastSeen: Date;
}

export interface OrganizerContact {
  name: string;
  role: string;
  phone: string;
  email: string;
  department: string;
}

export interface HeatmapConfig {
  enabled: boolean;
  updateInterval: number; // milliseconds
  intensityThreshold: {
    low: number;
    medium: number;
    high: number;
  };
  colors: {
    low: string;
    medium: string;
    high: string;
    critical: string;
  };
  blur: number;
  opacity: number;
}

export interface NotificationSettings {
  enabled: boolean;
  channels: {
    whatsapp: boolean;
    email: boolean;
    sms: boolean;
  };
  thresholds: {
    occupancyRate: number; // percentage
    trafficFlow: number; // people per minute
    dwellTime: number; // minutes
  };
  zoneSpecific: {
    [zoneId: string]: {
      enabled: boolean;
      customThresholds?: Partial<NotificationSettings['thresholds']>;
    };
  };
}

export interface RecommendationInsight {
  id: string;
  type: 'traffic' | 'occupancy' | 'bottleneck' | 'safety';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  suggestedAction: string;
  affectedZones: string[];
  timestamp: Date;
  actionable: boolean;
}

// AI Prediction Types
export interface PredictionModel {
  id: string;
  name: string;
  version: string;
  endpoint: string;
  confidence: number;
  lastTrained: Date;
}

export interface CongestionPrediction {
  zoneId: string;
  zoneName: string;
  predictedTime: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-1
  confidence: number; // 0-1
  expectedDuration: number; // minutes
  peakOccupancy: number;
  riskScore: number; // 0-100
  factors: string[];
  recommendations: string[];
}

export interface PredictionHeatmap {
  zoneId: string;
  points: PredictionPoint[];
  timeWindow: {
    start: Date;
    end: Date;
  };
  maxIntensity: number;
  confidence: number;
}

export interface PredictionPoint {
  x: number;
  y: number;
  intensity: number;
  probability: number;
  timestamp: Date;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface PredictionSummary {
  totalPredictions: number;
  highRiskZones: number;
  avgConfidence: number;
  nextBottleneck: {
    zoneId: string;
    zoneName: string;
    timeToOccur: number; // minutes
    severity: CongestionPrediction['severity'];
  } | null;
  recommendedActions: OperationalAction[];
}

export interface OperationalAction {
  id: string;
  type: 'redirect' | 'capacity-increase' | 'early-warning' | 'staff-deployment';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  targetZones: string[];
  estimatedImpact: number; // percentage reduction in congestion
  timeToImplement: number; // minutes
  status: 'suggested' | 'approved' | 'in-progress' | 'completed';
}

export interface PredictionConfig {
  enabled: boolean;
  timeHorizon: number; // minutes (5-60)
  updateInterval: number; // milliseconds
  confidenceThreshold: number; // 0-1
  showOverlay: boolean;
  overlayOpacity: number;
  colors: {
    low: string;
    medium: string;
    high: string;
    critical: string;
  };
}

export interface SageMakerResponse {
  predictions: CongestionPrediction[];
  heatmaps: PredictionHeatmap[];
  summary: PredictionSummary;
  modelInfo: PredictionModel;
  timestamp: Date;
}

// Notification Management Types
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  whatsapp?: string;
  role: string;
  group: 'security' | 'management' | 'operations' | 'medical';
  isPrimary?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SectionInsight {
  id: string;
  sectionId: string;
  sectionName: string;
  type: 'congestion' | 'capacity' | 'flow' | 'timing';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  metrics?: Record<string, string | number>;
  timestamp: Date;
  isActive: boolean;
}

export interface NotificationHistory {
  id: string;
  sectionId: string;
  sectionName: string;
  message: string;
  recipients: Array<{
    contactId: string;
    name: string;
    phone: string;
    email?: string;
    whatsapp?: string;
  }>;
  channels: string[];
  timestamp: Date;
  status: 'sent' | 'pending' | 'failed';
  deliveryStatus: Record<string, 'delivered' | 'failed' | 'pending'>;
}

// Queue Flow Types
export interface QueueStationData {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'entry' | 'checkpoint' | 'scanner' | 'pickup' | 'exit';
  occupancy: number;
  capacity: number;
  waitTime: number; // minutes
  queueLength: number; // people in queue
  status: 'normal' | 'busy' | 'congested';
}