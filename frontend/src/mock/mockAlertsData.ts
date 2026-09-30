import { SmartAlertItem, SmartAlertsSummaryStats } from '../types';

export const mockAlertsSummary: SmartAlertsSummaryStats = {
  activeAlerts: 5,
  highPriority: 2,
  newToday: 3,
  historicalSignals: 4,
};

export const mockSmartAlertsList: SmartAlertItem[] = [
  // ALERT 1 — HIGH
  {
    id: 'alt-1',
    competitor: 'Competitor A',
    title: 'Competitor A Activity Spike',
    priority: 'high',
    type: 'activity-spike',
    description: 'Competitor A activity is significantly above its historical baseline.',
    detectedDisplay: '2 hours ago',
    timestamp: '2026-09-30T08:30:00Z',
    historicalEvidenceCount: 11,
    previousMatchesCount: 2,
    read: false,
    whyItMatters: "Current activity is 42% above Competitor A's normal historical baseline, indicating coordinated preparatory motions across pricing and web surfaces.",
    observationFact: 'Competitor A recorded 11 activities this week across pricing tables, careers portal, and product landing pages.',
    interpretation: 'This activity level is significantly above its historical baseline.',
    possibleSignal: 'This may indicate increased product or marketing activity ahead of quarterly enterprise budget allocations.',
    relatedEventsSequence: ['Activity Spike', 'Pricing Change', 'Product Update'],
    relatedInsightId: 'ins-featured',
    relatedTimelineEventId: 'ev-sep28-a'
  },

  // ALERT 2 — HIGH
  {
    id: 'alt-2',
    competitor: 'Competitor A',
    title: 'Repeated Pricing Pattern',
    priority: 'high',
    type: 'pattern',
    description: 'Competitor A has repeated a pricing behavior previously followed by product activity.',
    detectedDisplay: '5 hours ago',
    timestamp: '2026-09-30T05:30:00Z',
    historicalEvidenceCount: 6,
    previousMatchesCount: 2,
    read: false,
    whyItMatters: 'Similar pricing activity was followed by product updates twice in the previous six months within approximately 10–14 days.',
    observationFact: 'Competitor A modified public subscription rates across three tiers on September 28 (+12% average hike).',
    interpretation: 'Historical evidence demonstrates a strong recurring pattern where price modifications precede major platform capability announcements.',
    possibleSignal: 'Follow-on feature release or agent suite upgrade likely within the next 8 to 14 days.',
    relatedEventsSequence: ['Pricing Change', 'Product Update', 'Marketing Activity'],
    relatedInsightId: 'ins-1',
    relatedTimelineEventId: 'ev-sep28-a'
  },

  // ALERT 3 — MEDIUM
  {
    id: 'alt-3',
    competitor: 'Competitor B',
    title: 'New Product Activity',
    priority: 'medium',
    type: 'product',
    description: 'Competitor B has published a new product capability.',
    detectedDisplay: 'Today',
    timestamp: '2026-09-30T02:15:00Z',
    historicalEvidenceCount: 4,
    previousMatchesCount: 1,
    read: false,
    whyItMatters: 'New autonomous reasoning engine capability added to main product navigation ahead of expected annual keynote.',
    observationFact: "Added 'Intelligent Copilot' anchor and interactive workflow demo on flagship product page.",
    interpretation: 'Competitor B is actively accelerating developer and platform tooling cadence.',
    possibleSignal: 'May indicate expanded enterprise push before Q4 budget finalization.',
    relatedEventsSequence: ['Product Activity', 'Beta Documentation', 'Enterprise Webinar'],
    relatedInsightId: 'ins-2',
    relatedTimelineEventId: 'ev-sep25-b'
  },

  // ALERT 4 — MEDIUM
  {
    id: 'alt-4',
    competitor: 'Competitor C',
    title: 'Hiring Activity Increase',
    priority: 'medium',
    type: 'hiring',
    description: 'Competitor C has increased technical hiring activity compared with its previous baseline.',
    detectedDisplay: 'Yesterday',
    timestamp: '2026-09-29T11:00:00Z',
    historicalEvidenceCount: 8,
    previousMatchesCount: 1,
    read: true,
    whyItMatters: 'Technical hiring velocity increased by 240% across distributed vector search and streaming pipeline engineering roles.',
    observationFact: 'Five senior engineering positions posted simultaneously on careers portal on September 21.',
    interpretation: 'Activity pattern aligns with platform infrastructure expansion following security module unbundling in May.',
    possibleSignal: 'May signal internal preparation for large-scale enterprise customer onboarding.',
    relatedEventsSequence: ['Hiring Expansion', 'Security Module Unbundled', 'API Rate Limits'],
    relatedInsightId: 'ins-3',
    relatedTimelineEventId: 'ev-sep21-c'
  },

  // ALERT 5 — LOW
  {
    id: 'alt-5',
    competitor: 'Competitor D',
    title: 'Website Activity Detected',
    priority: 'low',
    type: 'website',
    description: "Changes were detected on Competitor D's product website.",
    detectedDisplay: '2 days ago',
    timestamp: '2026-09-28T09:45:00Z',
    historicalEvidenceCount: 3,
    previousMatchesCount: 1,
    read: true,
    whyItMatters: 'Updated homepage customer benchmark case studies and downloadable enterprise ROI calculator.',
    observationFact: 'Published 3 new Fortune 500 evaluation studies showcasing 40% cost reduction claims.',
    interpretation: 'Competitor D is refreshing competitive sales collateral to support inbound enterprise bake-offs.',
    possibleSignal: 'May precede targeted displacement campaign in financial services accounts.',
    relatedEventsSequence: ['Website Benchmark Studies', 'Inbound Demo Surge', 'Displacement Campaign'],
    relatedInsightId: 'ins-4',
    relatedTimelineEventId: 'ev-jun18-d'
  }
];
