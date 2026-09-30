import { 
  DashboardActivityItem, 
  DashboardAlertItem, 
  DashboardIntelligenceBrief, 
  HistoricalMemoryStats,
  ActivityChartDataPoint
} from '../types';

export interface DashboardKPICardData {
  id: string;
  label: string;
  value: string | number;
  supportingText: string;
  changeIndicator: string;
  isPositiveChange?: boolean;
  category: 'competitors' | 'changes' | 'patterns' | 'alerts';
}

export const mockDashboardKPIs: DashboardKPICardData[] = [
  {
    id: 'kpi-1',
    label: 'Competitors Tracked',
    value: '12',
    supportingText: 'Across active monitoring',
    changeIndicator: '+2 this quarter',
    isPositiveChange: true,
    category: 'competitors',
  },
  {
    id: 'kpi-2',
    label: 'Changes Detected',
    value: '48',
    supportingText: 'This month',
    changeIndicator: '+12% activity',
    isPositiveChange: true,
    category: 'changes',
  },
  {
    id: 'kpi-3',
    label: 'Patterns Detected',
    value: '7',
    supportingText: 'From historical activity',
    changeIndicator: '+3 patterns',
    isPositiveChange: true,
    category: 'patterns',
  },
  {
    id: 'kpi-4',
    label: 'Active Alerts',
    value: '5',
    supportingText: 'Require attention',
    changeIndicator: '2 new alerts',
    isPositiveChange: false,
    category: 'alerts',
  },
];

export const mockActivityChartData: Record<'6M' | '30D' | '7D', ActivityChartDataPoint[]> = {
  '6M': [
    { period: 'April', 'Competitor A': 8, 'Competitor B': 12, 'Competitor C': 6, changeA: '+8% vs prev', changeB: '+4% vs prev', changeC: '-2% vs prev' },
    { period: 'May', 'Competitor A': 11, 'Competitor B': 14, 'Competitor C': 9, changeA: '+14% vs prev', changeB: '+7% vs prev', changeC: '+12% vs prev' },
    { period: 'June', 'Competitor A': 14, 'Competitor B': 10, 'Competitor C': 12, changeA: '+18% vs prev', changeB: '-15% vs prev', changeC: '+8% vs prev' },
    { period: 'July', 'Competitor A': 18, 'Competitor B': 15, 'Competitor C': 11, changeA: '+22% vs prev', changeB: '+10% vs prev', changeC: '-4% vs prev' },
    { period: 'August', 'Competitor A': 24, 'Competitor B': 18, 'Competitor C': 16, changeA: '+24% vs previous period', changeB: '+12% vs prev', changeC: '+15% vs prev' },
    { period: 'September', 'Competitor A': 31, 'Competitor B': 22, 'Competitor C': 19, changeA: '+29% vs previous period', changeB: '+18% vs prev', changeC: '+10% vs prev' },
  ],
  '30D': [
    { period: 'Week 1', 'Competitor A': 5, 'Competitor B': 4, 'Competitor C': 3, changeA: '+10% vs prev', changeB: '+2% vs prev', changeC: '-1% vs prev' },
    { period: 'Week 2', 'Competitor A': 7, 'Competitor B': 5, 'Competitor C': 5, changeA: '+15% vs prev', changeB: '+8% vs prev', changeC: '+14% vs prev' },
    { period: 'Week 3', 'Competitor A': 9, 'Competitor B': 6, 'Competitor C': 4, changeA: '+21% vs prev', changeB: '+4% vs prev', changeC: '-8% vs prev' },
    { period: 'Week 4', 'Competitor A': 12, 'Competitor B': 7, 'Competitor C': 7, changeA: '+28% vs previous period', changeB: '+11% vs prev', changeC: '+18% vs prev' },
  ],
  '7D': [
    { period: 'Mon', 'Competitor A': 2, 'Competitor B': 1, 'Competitor C': 0, changeA: '+5%', changeB: '0%', changeC: '-10%' },
    { period: 'Tue', 'Competitor A': 1, 'Competitor B': 2, 'Competitor C': 1, changeA: '-8%', changeB: '+12%', changeC: '+5%' },
    { period: 'Wed', 'Competitor A': 4, 'Competitor B': 1, 'Competitor C': 2, changeA: '+32%', changeB: '-5%', changeC: '+10%' },
    { period: 'Thu', 'Competitor A': 3, 'Competitor B': 2, 'Competitor C': 1, changeA: '+12%', changeB: '+8%', changeC: '-4%' },
    { period: 'Fri', 'Competitor A': 5, 'Competitor B': 3, 'Competitor C': 2, changeA: '+40%', changeB: '+15%', changeC: '+8%' },
    { period: 'Sat', 'Competitor A': 1, 'Competitor B': 0, 'Competitor C': 1, changeA: '-15%', changeB: '-20%', changeC: '0%' },
    { period: 'Sun', 'Competitor A': 2, 'Competitor B': 1, 'Competitor C': 0, changeA: '+10%', changeB: '+5%', changeC: '-10%' },
  ],
};

export const mockDashboardIntelligenceBrief: DashboardIntelligenceBrief = {
  title: 'AI Intelligence Brief',
  supportingText: 'Generated from historical competitor activity.',
  intelligence:
    'Competitor A has shown increased activity over the last 3 months. Three pricing changes were followed by product updates within 10–14 days. Similar activity appeared twice during the previous six months.',
  patternLabel: 'PATTERN DETECTED',
  confidenceScore: 87,
  historicalEventsCount: 6,
};

export const mockRecentActivities: DashboardActivityItem[] = [
  {
    id: 'act-1',
    competitor: 'Competitor A',
    type: 'Pricing Change',
    description: 'Pricing increased by 12%.',
    timestamp: '2 hours ago',
    importance: 'high',
  },
  {
    id: 'act-2',
    competitor: 'Competitor B',
    type: 'Product Activity',
    description: 'New product capability detected.',
    timestamp: '5 hours ago',
    importance: 'medium',
  },
  {
    id: 'act-3',
    competitor: 'Competitor C',
    type: 'Activity Spike',
    description: 'Activity increased significantly compared with its baseline.',
    timestamp: 'Yesterday',
    importance: 'high',
  },
  {
    id: 'act-4',
    competitor: 'Competitor A',
    type: 'Website Change',
    description: 'Major website content update detected.',
    timestamp: '2 days ago',
    importance: 'low',
  },
];

export const mockActiveAlertsPreview: DashboardAlertItem[] = [
  {
    id: 'alt-prev-1',
    title: 'Competitor A Activity Spike',
    description: 'Activity is significantly higher than its historical baseline.',
    competitor: 'Competitor A',
    severity: 'high',
    timestamp: '2 hours ago',
  },
  {
    id: 'alt-prev-2',
    title: 'Repeated Pricing Pattern',
    description: 'Similar behavior has been observed before a previous product update.',
    competitor: 'Competitor A',
    severity: 'medium',
    timestamp: '1 day ago',
  },
  {
    id: 'alt-prev-3',
    title: 'New Activity Detected',
    description: 'New competitor activity has been detected.',
    competitor: 'Competitor C',
    severity: 'low',
    timestamp: '2 days ago',
  },
];

export const mockHistoricalMemoryStats: HistoricalMemoryStats = {
  title: 'Historical Intelligence',
  subtitle: '6 months of competitor activity available',
  timeframe: '6 Months',
  eventsCount: 184,
  sourcesCount: 23,
  patternsCount: 7,
} as HistoricalMemoryStats & { title: string };
