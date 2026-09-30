export type EventCategory = 
  | 'pricing' 
  | 'product' 
  | 'feature' 
  | 'hiring' 
  | 'leadership' 
  | 'partnership' 
  | 'funding' 
  | 'market' 
  | 'strategy' 
  | 'other';

export type EventImportance = 'low' | 'medium' | 'high' | 'critical';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface Competitor {
  id: number;
  name: string;
  website?: string;
  industry?: string;
  description?: string;
  tier?: 'Tier 1 - Primary' | 'Tier 2 - Emerging' | 'Tier 3 - Niche';
  threatLevel?: 'high' | 'medium' | 'low';
  techStack?: string[];
  activeSignalsCount?: number;
  lastActive?: string;
}

export interface ActivityEvent {
  id: number | string;
  competitorId: number;
  competitorName: string;
  title: string;
  description: string;
  category: EventCategory;
  importance: EventImportance;
  eventDate: string;
  previousValue?: string;
  newValue?: string;
  sourceUrl?: string;
  sourceName?: string;
  memoryDocId?: string;
}

export interface SmartAlert {
  id: string;
  competitorId: number;
  competitorName: string;
  title: string;
  description: string;
  category: EventCategory;
  severity: AlertSeverity;
  createdAt: string;
  isAcknowledged: boolean;
  actionRequired?: string;
  memoryDocId?: string;
}

export interface StrategicInsight {
  id: string;
  competitorId?: number;
  competitorName?: string;
  title: string;
  type: 'pattern' | 'swot' | 'threat' | 'prediction';
  summary: string;
  facts: string[];
  observations: string[];
  implications: string[];
  confidenceScore: number;
  detectedAt: string;
  category: EventCategory;
  citations: string[];
}

export interface ChatEvidenceStep {
  label: string;
  date?: string;
  type?: string;
  daysOffset?: number;
}

export interface ChatEvidenceData {
  summary: string;
  eventsCount: number;
  matchesCount: number;
  sequence?: ChatEvidenceStep[];
  observedData?: string[];
  aiInterpretation?: string;
  confidence?: number;
  timelineEventId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  competitorContext?: string;
  summary?: string;
  keyFindings?: string[];
  evidence?: ChatEvidenceData;
  facts?: string[];
  observations?: string[];
  citations?: string[];
  isStreaming?: boolean;
}

export interface RecentConversationItem {
  id: string;
  title: string;
  dateLabel: string;
  previewText: string;
}

export interface KPIStat {
  id: string;
  label: string;
  value: string | number;
  change?: string;
  isPositiveChange?: boolean;
  subtext: string;
  category: 'competitors' | 'signals' | 'memory' | 'threats';
}

export interface SystemStatus {
  hindsightConnected: boolean;
  postgresConnected: boolean;
  groqConnected: boolean;
  memoryRetentionRate: string;
  activeMemoryDocuments: number;
  lastSyncedAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  initials: string;
}

// Dashboard-Specific Models (Phase 2)
export interface DashboardActivityItem {
  id: string;
  competitor: string;
  type: string;
  description: string;
  timestamp: string;
  importance: 'high' | 'medium' | 'low';
}

export interface DashboardAlertItem {
  id: string;
  title: string;
  competitor: string;
  description: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
}

export interface DashboardIntelligenceBrief {
  title: string;
  supportingText: string;
  intelligence: string;
  patternLabel: string;
  confidenceScore: number;
  historicalEventsCount: number;
}

export interface HistoricalMemoryStats {
  title?: string;
  timeframe: string;
  eventsCount: number;
  sourcesCount: number;
  patternsCount: number;
  subtitle: string;
}

export interface ActivityChartDataPoint {
  period: string;
  'Competitor A': number;
  'Competitor B': number;
  'Competitor C': number;
  changeA?: string;
  changeB?: string;
  changeC?: string;
}

// Phase 3 — Historical Timeline Data Architecture
export interface HistoricalSequenceStep {
  label: string;
  daysOffset?: number;
}

export interface HistoricalContextData {
  summary: string;
  similarCount: number;
  sequence?: HistoricalSequenceStep[];
}

export interface TimelineEvent {
  id: string;
  competitor: string;
  type: 'Pricing' | 'Product' | 'Hiring' | 'Marketing' | 'Website';
  title: string;
  description: string;
  fullDescription?: string;
  timestamp: string;
  dateDisplay: string;
  timeDisplay: string;
  importance: 'high' | 'medium' | 'low';
  source: string;
  detectedChanges?: string[];
  historicalContext?: HistoricalContextData;
  relatedEventIds?: string[];
}

export interface TimelineSummaryStats {
  totalEvents: number;
  totalCompetitors: number;
  totalSources: number;
  detectedPatterns: number;
}

// Phase 4 — AI Insights Architecture
export type AIInsightType = 'pattern' | 'trend' | 'unusual' | 'historical';
export type InsightPriority = 'high' | 'medium' | 'low';

export interface EvidenceSequenceEvent {
  label: string;
  date?: string;
  type?: string;
  daysOffset?: number;
}

export interface InsightEvidenceDetails {
  currentEvent: {
    title: string;
    date: string;
    type: string;
  };
  historicalSequence: EvidenceSequenceEvent[];
  similarSequenceStatement: string;
  observedFacts: string[];
  aiInterpretation: string;
  whyThisMatters: string;
  timeRelationship: string;
  historicalMatchesList: string[];
}

export interface AIInsightItem {
  id: string;
  type: AIInsightType;
  title: string;
  competitor: string;
  description: string;
  confidence: number;
  evidenceCount: number;
  historicalMatches: number;
  priority: InsightPriority;
  timeframeDays: number;
  detectedPatternFlow?: string[];
  relatedTimelineEventId?: string;
  isFeatured?: boolean;
  evidenceDetails?: InsightEvidenceDetails;
}

export interface AIInsightsSummaryStats {
  patternsDetected: number;
  historicalMatches: number;
  activeSignals: number;
  averageConfidence: number;
}

// Phase 6 — Smart Alerts Architecture
export type SmartAlertType =
  | 'activity-spike'
  | 'pattern'
  | 'pricing'
  | 'product'
  | 'website'
  | 'hiring'
  | 'marketing';

export type AlertPriority = 'high' | 'medium' | 'low';

export interface SmartAlertItem {
  id: string;
  competitor: string;
  title: string;
  description: string;
  priority: AlertPriority;
  type: SmartAlertType;
  timestamp: string;
  detectedDisplay: string;
  historicalEvidenceCount: number;
  previousMatchesCount?: number;
  relatedEventIds?: string[];
  read: boolean;
  whyItMatters: string;
  observationFact?: string;
  interpretation?: string;
  possibleSignal?: string;
  relatedEventsSequence?: string[];
  relatedInsightId?: string;
  relatedTimelineEventId?: string;
}

export interface SmartAlertsSummaryStats {
  activeAlerts: number;
  highPriority: number;
  newToday: number;
  historicalSignals: number;
}

