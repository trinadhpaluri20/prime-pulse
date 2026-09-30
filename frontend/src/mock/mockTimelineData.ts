import { TimelineEvent, TimelineSummaryStats } from '../types';

export const mockTimelineSummary: TimelineSummaryStats = {
  totalEvents: 184,
  totalCompetitors: 12,
  totalSources: 23,
  detectedPatterns: 7,
};

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: 'ev-sep28-a',
    competitor: 'Competitor A',
    type: 'Pricing',
    title: 'Pricing Change',
    description: 'Pricing increased by 12% across three plans.',
    fullDescription: 'Observed automated tier revision across Standard, Pro, and Enterprise tiers. Average monthly commitment increased by 12% with mandatory annual billing option introduced.',
    timestamp: '2026-09-28T10:30:00Z',
    dateDisplay: 'September 28, 2026',
    timeDisplay: '10:30 AM',
    importance: 'high',
    source: 'Competitor Website',
    detectedChanges: [
      'Standard tier raised from $79 to $89/mo (+12.6%)',
      'Pro tier updated from $199 to $224/mo (+12.5%)',
      'Enterprise base threshold raised to $2,500/mo'
    ],
    historicalContext: {
      summary: 'Similar pricing activity detected twice previously.',
      similarCount: 2,
      sequence: [
        { label: 'Pricing increased by 12%' },
        { label: 'Product Update', daysOffset: 8 },
        { label: 'Marketing Campaign', daysOffset: 6 }
      ]
    },
    relatedEventIds: ['ev-sep15-a', 'ev-jul04-a']
  },
  {
    id: 'ev-sep25-b',
    competitor: 'Competitor B',
    type: 'Product',
    title: 'Product Activity',
    description: 'New product capability detected on the product page.',
    fullDescription: 'Detected new autonomous reasoning engine preview on the flagship product page with live interactive demonstration capabilities and SDK previews.',
    timestamp: '2026-09-25T14:15:00Z',
    dateDisplay: 'September 25, 2026',
    timeDisplay: '02:15 PM',
    importance: 'medium',
    source: 'Product Website',
    detectedChanges: [
      'Added "Intelligent Copilot" navigation anchor',
      'Published dynamic interactive workflow widget',
      'Updated API documentation references'
    ],
    historicalContext: {
      summary: 'Similar activity appeared before the previous product update.',
      similarCount: 3,
      sequence: [
        { label: 'New product capability detected' },
        { label: 'Beta Documentation Published', daysOffset: 12 },
        { label: 'Enterprise Webinar', daysOffset: 5 }
      ]
    },
    relatedEventIds: ['ev-aug12-b', 'ev-may27-b']
  },
  {
    id: 'ev-sep21-c',
    competitor: 'Competitor C',
    type: 'Hiring',
    title: 'Hiring Activity',
    description: 'Five new engineering positions were posted.',
    fullDescription: 'Opened five senior engineering roles specifically dedicated to distributed vector indexing and real-time streaming data ingestion pipelines.',
    timestamp: '2026-09-21T11:00:00Z',
    dateDisplay: 'September 21, 2026',
    timeDisplay: '11:00 AM',
    importance: 'medium',
    source: 'Careers Page',
    detectedChanges: [
      'Principal Distributed Systems Engineer (x2)',
      'Senior AI Performance Optimizer (x1)',
      'Lead Streaming Infrastructure Architect (x2)'
    ],
    historicalContext: {
      summary: 'Engineering hiring increased during the previous expansion period.',
      similarCount: 1,
      sequence: [
        { label: 'Five new engineering positions posted' },
        { label: 'Infrastructure Scaling Role', daysOffset: 15 },
        { label: 'Lead AI Architect Recruited', daysOffset: 7 }
      ]
    },
    relatedEventIds: ['ev-jul22-c', 'ev-may10-c']
  },
  {
    id: 'ev-sep15-a',
    competitor: 'Competitor A',
    type: 'Website',
    title: 'Website Change',
    description: 'Major changes detected on the product landing page.',
    fullDescription: 'Hero banner overhaul and messaging pivot from generic automation to high-throughput enterprise intelligence and compliance-first architecture.',
    timestamp: '2026-09-15T09:45:00Z',
    dateDisplay: 'September 15, 2026',
    timeDisplay: '09:45 AM',
    importance: 'low',
    source: 'Competitor Website',
    detectedChanges: [
      'Headline updated to "Next-Gen Enterprise Speed"',
      'New enterprise trust badges and ISO compliance logos',
      'Direct booking link replacing email waitlist'
    ],
    historicalContext: {
      summary: 'Similar website activity occurred before a previous campaign.',
      similarCount: 2,
      sequence: [
        { label: 'Major changes detected on product landing page' },
        { label: 'Positioning Copy Update', daysOffset: 9 },
        { label: 'Feature Comparison Matrix', daysOffset: 4 }
      ]
    },
    relatedEventIds: ['ev-sep28-a', 'ev-jul04-a']
  },
  {
    id: 'ev-aug29-d',
    competitor: 'Competitor D',
    type: 'Marketing',
    title: 'Strategic Campaign Launch',
    description: 'Targeted displacement campaign launched targeting legacy accounts.',
    fullDescription: 'Launched aggressive multi-channel comparative advertising and migration discount incentive program aimed directly at incumbent market leaders.',
    timestamp: '2026-08-29T16:30:00Z',
    dateDisplay: 'August 29, 2026',
    timeDisplay: '04:30 PM',
    importance: 'high',
    source: 'Marketing Channel',
    detectedChanges: [
      'Published 3 competitive migration guides',
      'Offered free data migration incentives for annual signups',
      'Sponsoring executive roundtables in 4 metro areas'
    ],
    historicalContext: {
      summary: 'Preceded by pricing adjustments 14 days earlier.',
      similarCount: 2,
      sequence: [
        { label: 'Displacement campaign launched' },
        { label: 'Account Executive Outreach', daysOffset: 10 },
        { label: 'Executive Dinner Series', daysOffset: 8 }
      ]
    },
    relatedEventIds: ['ev-jun18-d', 'ev-apr14-d']
  },
  {
    id: 'ev-aug12-b',
    competitor: 'Competitor B',
    type: 'Pricing',
    title: 'Annual Contract Discount Shift',
    description: 'Introduced 20% discount on upfront multi-year commitments.',
    fullDescription: 'Added custom contract duration options with progressive discounts up to 20% for 24-month upfront payment commitments.',
    timestamp: '2026-08-12T13:20:00Z',
    dateDisplay: 'August 12, 2026',
    timeDisplay: '01:20 PM',
    importance: 'medium',
    source: 'Pricing Page',
    detectedChanges: [
      'Added 2-year upfront commitment option',
      'Lowered onboarding implementation fee by 50%',
      'Added complimentary enterprise SLA support tier'
    ],
    historicalContext: {
      summary: 'Observed annually ahead of Q3 procurement cycles.',
      similarCount: 3,
      sequence: [
        { label: 'Upfront multi-year discount introduced' },
        { label: 'Quarterly Procurement Push', daysOffset: 14 },
        { label: 'Enterprise Contract Surge', daysOffset: 20 }
      ]
    },
    relatedEventIds: ['ev-sep25-b', 'ev-may27-b']
  },
  {
    id: 'ev-jul22-c',
    competitor: 'Competitor C',
    type: 'Product',
    title: 'API Rate Limit & Tiering Update',
    description: 'Tiered developer rate limits rolled out across public API.',
    fullDescription: 'Restricted free developer tier from unlimited to 500 requests/day, mandating Commercial tier for production API keys.',
    timestamp: '2026-07-22T10:15:00Z',
    dateDisplay: 'July 22, 2026',
    timeDisplay: '10:15 AM',
    importance: 'high',
    source: 'Developer Docs',
    detectedChanges: [
      'Free tier capped at 500 req/day',
      'Commercial key requirement enforced',
      'Webhooks moved behind paid plan tier'
    ],
    historicalContext: {
      summary: 'Similar tiering restriction observed during 2025 enterprise migration.',
      similarCount: 2,
      sequence: [
        { label: 'API limits tightened on free tier' },
        { label: 'Enterprise Plan Repackaging', daysOffset: 18 },
        { label: 'Sales Outreach to Free Power Users', daysOffset: 7 }
      ]
    },
    relatedEventIds: ['ev-sep21-c', 'ev-may10-c']
  },
  {
    id: 'ev-jul04-a',
    competitor: 'Competitor A',
    type: 'Hiring',
    title: 'Enterprise GTM Leadership Appointed',
    description: 'VP of Global Enterprise Sales recruited from Tier-1 SaaS provider.',
    fullDescription: 'Confirmed appointment of veteran enterprise sales leader to scale direct sales force across North America and EMEA.',
    timestamp: '2026-07-04T15:00:00Z',
    dateDisplay: 'July 04, 2026',
    timeDisplay: '03:00 PM',
    importance: 'high',
    source: 'Careers Page',
    detectedChanges: [
      'VP Enterprise Sales profile added to leadership team',
      'Created 8 regional account executive openings',
      'Established regional sales hub in New York'
    ],
    historicalContext: {
      summary: 'Preceded aggressive Q3 outreach campaign and subsequent pricing adjustment.',
      similarCount: 2,
      sequence: [
        { label: 'VP Enterprise Sales appointed' },
        { label: 'Mid-Market Outreach Ramp', daysOffset: 21 },
        { label: 'Pricing restructuring announced', daysOffset: 30 }
      ]
    },
    relatedEventIds: ['ev-sep28-a', 'ev-sep15-a']
  },
  {
    id: 'ev-jun18-d',
    competitor: 'Competitor D',
    type: 'Website',
    title: 'Customer Benchmark Studies Published',
    description: 'Published 3 new Fortune 500 benchmark studies on homepage.',
    fullDescription: 'Highlighted 40% cost reduction and 3x faster response times in head-to-head enterprise evaluation studies.',
    timestamp: '2026-06-18T11:30:00Z',
    dateDisplay: 'June 18, 2026',
    timeDisplay: '11:30 AM',
    importance: 'low',
    source: 'Competitor Website',
    detectedChanges: [
      'Added Fortune 500 case study carousel',
      'Published downloadable ROI calculator',
      'Included third-party benchmark report download'
    ],
    historicalContext: {
      summary: 'Correlated with competitive bake-offs in financial services accounts.',
      similarCount: 1,
      sequence: [
        { label: 'Benchmark studies published' },
        { label: 'Inbound Demo Request Surge', daysOffset: 12 },
        { label: 'Displacement Campaign Launch', daysOffset: 35 }
      ]
    },
    relatedEventIds: ['ev-aug29-d', 'ev-apr14-d']
  },
  {
    id: 'ev-may27-b',
    competitor: 'Competitor B',
    type: 'Marketing',
    title: 'Global Virtual Summit Announced',
    description: 'Announced annual product showcase summit focusing on AI workflows.',
    fullDescription: 'Opened registration for virtual keynote and developer sessions showcasing next-generation workflow integrations.',
    timestamp: '2026-05-27T09:15:00Z',
    dateDisplay: 'May 27, 2026',
    timeDisplay: '09:15 AM',
    importance: 'medium',
    source: 'Marketing Channel',
    detectedChanges: [
      'Summit landing page published with agenda',
      'Partner sponsors announced (8 cloud ecosystem partners)',
      'Keynote preview featuring automated intelligence tools'
    ],
    historicalContext: {
      summary: 'Annual event consistently used for major product release announcements.',
      similarCount: 2,
      sequence: [
        { label: 'Summit announcement' },
        { label: 'Keynote Demo Release', daysOffset: 45 },
        { label: 'General Availability Launch', daysOffset: 15 }
      ]
    },
    relatedEventIds: ['ev-sep25-b', 'ev-aug12-b']
  },
  {
    id: 'ev-may10-c',
    competitor: 'Competitor C',
    type: 'Pricing',
    title: 'Security Module Unbundled',
    description: 'Separated advanced security features into standalone paid add-ons.',
    fullDescription: 'SOC2 reports, SSO/SAML, and custom audit logs moved from core enterprise into $499/mo add-on package.',
    timestamp: '2026-05-10T14:45:00Z',
    dateDisplay: 'May 10, 2026',
    timeDisplay: '02:45 PM',
    importance: 'high',
    source: 'Pricing Page',
    detectedChanges: [
      'SSO/SAML moved to paid add-on tier',
      'Dedicated audit logs separated into compliance pack',
      'Updated terms of service for security data retention'
    ],
    historicalContext: {
      summary: 'Follows industry pattern of modular upsells prior to feature tiering.',
      similarCount: 2,
      sequence: [
        { label: 'Security module unbundled' },
        { label: 'Compliance Add-On Launch', daysOffset: 10 },
        { label: 'Enterprise Tier Price Adjustment', daysOffset: 25 }
      ]
    },
    relatedEventIds: ['ev-sep21-c', 'ev-jul22-c']
  },
  {
    id: 'ev-apr14-d',
    competitor: 'Competitor D',
    type: 'Product',
    title: 'Mobile Client 2.0 Release',
    description: 'Revamped iOS & Android companion applications with offline sync.',
    fullDescription: 'Redesigned mobile experience with offline data caching, push alerting, and bi-directional real-time sync.',
    timestamp: '2026-04-14T08:30:00Z',
    dateDisplay: 'April 14, 2026',
    timeDisplay: '08:30 AM',
    importance: 'medium',
    source: 'Product Website',
    detectedChanges: [
      'iOS App Store v2.0 build released',
      'Google Play Store v2.0 build released',
      'Added biometric authentication and offline sync'
    ],
    historicalContext: {
      summary: 'Completed 6-month cross-platform overhaul roadmap.',
      similarCount: 1,
      sequence: [
        { label: 'Mobile Client 2.0 released' },
        { label: 'SDK Version 3.0 Release', daysOffset: 20 },
        { label: 'Ecosystem Partner Integration', daysOffset: 30 }
      ]
    },
    relatedEventIds: ['ev-aug29-d', 'ev-jun18-d']
  }
];
