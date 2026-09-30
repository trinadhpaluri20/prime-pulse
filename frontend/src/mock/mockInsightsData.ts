import { AIInsightItem, AIInsightsSummaryStats } from '../types';

export const mockInsightsSummary: AIInsightsSummaryStats = {
  patternsDetected: 7,
  historicalMatches: 14,
  activeSignals: 5,
  averageConfidence: 84,
};

export const featuredInsight: AIInsightItem = {
  id: 'ins-featured',
  isFeatured: true,
  type: 'pattern',
  title: 'Pricing Changes Are Frequently Followed by Product Activity',
  competitor: 'Competitor A',
  description: 'Competitor A has changed pricing three times during the last six months. In two previous instances, a product update followed within approximately 10–14 days.',
  confidence: 87,
  evidenceCount: 6,
  historicalMatches: 2,
  priority: 'high',
  timeframeDays: 180,
  detectedPatternFlow: ['Pricing Change', '8–14 Days', 'Product Update', 'Marketing Activity'],
  relatedTimelineEventId: 'ev-sep28-a',
  evidenceDetails: {
    currentEvent: {
      title: 'Pricing Change (12% increase across 3 plans)',
      date: 'September 28, 2026',
      type: 'Pricing'
    },
    historicalSequence: [
      { label: 'Pricing Change', date: 'June 12, 2026', type: 'Pricing' },
      { label: 'Product Update', date: 'June 24, 2026', type: 'Product', daysOffset: 12 },
      { label: 'Marketing Activity', date: 'July 2, 2026', type: 'Marketing', daysOffset: 8 }
    ],
    similarSequenceStatement: 'Similar sequence detected 2 times previously.',
    observedFacts: [
      'Competitor A changed pricing three times during the trailing six months.',
      'Product update releases occurred on June 24 and January 18 following pricing shifts.',
      'Marketing campaigns launched within 7 to 10 days of each product release.'
    ],
    aiInterpretation: 'Similar pricing changes were followed by product activity and subsequent marketing campaigns across previous observation windows.',
    whyThisMatters: 'This pattern may indicate that pricing changes are often part of a broader product or marketing sequence for this competitor, allowing proactive positioning before follow-on feature announcements.',
    timeRelationship: 'Pricing Change → 8–14 days → Product Update → 6–8 days → Marketing Activity',
    historicalMatchesList: [
      'Match #1: June 12 – July 2, 2026 (Enterprise Tier Restructure → Copilot Beta → Summer Showcase)',
      'Match #2: January 10 – January 28, 2026 (Seat Price Revision → SDK 2.0 → Kickoff Campaign)'
    ]
  }
};

export const mockInsightsList: AIInsightItem[] = [
  // 1. PATTERN DETECTED
  {
    id: 'ins-1',
    type: 'pattern',
    title: 'Pricing → Product Activity Pattern',
    competitor: 'Competitor A',
    description: 'Similar pricing changes were followed by product activity in previous periods.',
    confidence: 87,
    evidenceCount: 6,
    historicalMatches: 2,
    priority: 'high',
    timeframeDays: 180,
    detectedPatternFlow: ['Pricing Change', '8–14 Days', 'Product Update', 'Marketing Activity'],
    relatedTimelineEventId: 'ev-sep28-a',
    evidenceDetails: {
      currentEvent: {
        title: 'Pricing Change (12% increase across 3 plans)',
        date: 'September 28, 2026',
        type: 'Pricing'
      },
      historicalSequence: [
        { label: 'Pricing Change', date: 'June 12, 2026', type: 'Pricing' },
        { label: 'Product Update', date: 'June 24, 2026', type: 'Product', daysOffset: 12 },
        { label: 'Marketing Activity', date: 'July 2, 2026', type: 'Marketing', daysOffset: 8 }
      ],
      similarSequenceStatement: 'Similar sequence detected 2 times previously.',
      observedFacts: [
        'Competitor A modified public subscription rates across three tiers on September 28.',
        'Historical precedent shows two identical price hikes in June and January.',
        'Each previous price adjustment was followed by a major product release within 14 days.'
      ],
      aiInterpretation: 'Historical evidence suggests that pricing restructuring serves as a preparatory signal for impending feature rollouts.',
      whyThisMatters: 'This pattern may indicate that pricing changes are often part of a broader product or marketing sequence for this competitor.',
      timeRelationship: 'Pricing Change → 8–14 days → Product Update',
      historicalMatchesList: [
        'Match #1: June 12 – June 24, 2026 (12-day window to Product Beta)',
        'Match #2: January 10 – January 24, 2026 (14-day window to SDK Release)'
      ]
    }
  },

  // 2. TREND DETECTED
  {
    id: 'ins-2',
    type: 'trend',
    title: 'Competitor B Activity Is Increasing',
    competitor: 'Competitor B',
    description: 'Competitor B activity has increased consistently during the last three months.',
    confidence: 82,
    evidenceCount: 18,
    historicalMatches: 3,
    priority: 'medium',
    timeframeDays: 90,
    detectedPatternFlow: ['Base Cadence', 'Consistent 45% Velocity Ramp', 'Multi-Modal Surge'],
    relatedTimelineEventId: 'ev-sep25-b',
    evidenceDetails: {
      currentEvent: {
        title: 'New Product Capability Preview Released',
        date: 'September 25, 2026',
        type: 'Product'
      },
      historicalSequence: [
        { label: 'Baseline Activity (2 moves/mo)', date: 'June 2026', type: 'Baseline' },
        { label: 'Cadence Inflection (5 moves/mo)', date: 'July 2026', daysOffset: 30 },
        { label: 'Velocity Acceleration (8 moves/mo)', date: 'August – September 2026', daysOffset: 45 }
      ],
      similarSequenceStatement: 'Velocity trend matches pre-launch cadence in Q3 2025.',
      observedFacts: [
        'Total observed competitor signals increased from 4 in June to 18 in late September.',
        'Weekly documentation commits and changelog updates increased by 65%.'
      ],
      aiInterpretation: 'Competitor B appears to be systematically ramping development velocity leading into Q4 budget cycles.',
      whyThisMatters: 'Accelerating market activity often indicates an imminent platform launch or competitive enterprise displacement campaign.',
      timeRelationship: 'Cadence Inflection → 60 days → Public Product Keynote',
      historicalMatchesList: [
        'Match #1: Q3 2025 (Pre-Copilot expansion wave)',
        'Match #2: Q1 2026 (Enterprise multi-tenant release)',
        'Match #3: Q3 2024 (Initial foundation platform debut)'
      ]
    }
  },

  // 3. UNUSUAL ACTIVITY
  {
    id: 'ins-3',
    type: 'unusual',
    title: 'Competitor C Activity Spike',
    competitor: 'Competitor C',
    description: "Current activity is significantly above the competitor's historical baseline.",
    confidence: 91,
    evidenceCount: 11,
    historicalMatches: 1,
    priority: 'high',
    timeframeDays: 30,
    detectedPatternFlow: ['Hiring Surge', 'Security Unbundling', 'API Tiering'],
    relatedTimelineEventId: 'ev-sep21-c',
    evidenceDetails: {
      currentEvent: {
        title: 'Five Senior Infrastructure Positions Posted',
        date: 'September 21, 2026',
        type: 'Hiring'
      },
      historicalSequence: [
        { label: 'Security Module Unbundled', date: 'May 10, 2026', type: 'Pricing' },
        { label: 'API Developer Rate Limits', date: 'July 22, 2026', daysOffset: 73 },
        { label: 'Hiring Expansion (5 Roles)', date: 'September 21, 2026', daysOffset: 61 }
      ],
      similarSequenceStatement: 'Observed activity is +240% above trailing 6-month baseline.',
      observedFacts: [
        'Simultaneous posting of 5 senior engineering roles on careers portal.',
        'Unbundled SOC2 compliance and SSO features into a paid tier in May.'
      ],
      aiInterpretation: 'A sharp volume deviation indicates focused infrastructure investment following enterprise security unbundling.',
      whyThisMatters: 'Unusual activity spikes in infrastructure hiring combined with API limit tightening often foreshadow enterprise monetization enforcement.',
      timeRelationship: 'Security Unbundle → 73 days → API Limits → 61 days → Talent Expansion',
      historicalMatchesList: [
        'Match #1: Mid-2025 (Enterprise compliance tier overhaul)'
      ]
    }
  },

  // 4. HISTORICAL MATCH
  {
    id: 'ins-4',
    type: 'historical',
    title: 'Current Activity Resembles Previous Launch',
    competitor: 'Competitor A',
    description: "Competitor A's current activity sequence is similar to activity observed before a previous product update.",
    confidence: 84,
    evidenceCount: 8,
    historicalMatches: 2,
    priority: 'medium',
    timeframeDays: 30,
    detectedPatternFlow: ['Landing Page Revamp', 'Pricing Revision', 'Expected Feature Beta'],
    relatedTimelineEventId: 'ev-sep15-a',
    evidenceDetails: {
      currentEvent: {
        title: 'Major Changes on Product Landing Page',
        date: 'September 15, 2026',
        type: 'Website'
      },
      historicalSequence: [
        { label: 'Landing Page Redesign', date: 'September 15, 2026', type: 'Website' },
        { label: 'Pricing Restructure (+12%)', date: 'September 28, 2026', daysOffset: 13 },
        { label: 'Anticipated Feature Launch', date: 'Mid October (Projected)', daysOffset: 14 }
      ],
      similarSequenceStatement: 'Sequence matches 2 previous flagship release patterns.',
      observedFacts: [
        'Landing page messaging updated to enterprise intelligence positioning on Sept 15.',
        'Pricing tier adjustment logged on Sept 28 (+12% across plans).'
      ],
      aiInterpretation: 'Current multi-channel moves closely match the pre-launch sequence observed before the Spring release.',
      whyThisMatters: 'Historical precedent suggests sales enablement collateral and product marketing updates will deploy within the next 2 weeks.',
      timeRelationship: 'Website messaging refresh → 13 days → Pricing update → 14 days → Product release',
      historicalMatchesList: [
        'Match #1: February 2026 (Web refresh → price change → v1.8 release)',
        'Match #2: October 2025 (Enterprise rebranding → pricing adjustment → v1.5 release)'
      ]
    }
  },

  // 5. TREND DETECTED (Competitor C)
  {
    id: 'ins-5',
    type: 'trend',
    title: 'Developer Monetization Tightening Trend',
    competitor: 'Competitor C',
    description: 'Progressive unbundling of developer access and platform capabilities over 6 months.',
    confidence: 88,
    evidenceCount: 9,
    historicalMatches: 2,
    priority: 'medium',
    timeframeDays: 180,
    detectedPatternFlow: ['Free Tier Capping', 'Paid Webhooks', 'Compliance Add-On'],
    relatedTimelineEventId: 'ev-jul22-c',
    evidenceDetails: {
      currentEvent: {
        title: 'Tiered Developer Rate Limits Enforced',
        date: 'July 22, 2026',
        type: 'Product'
      },
      historicalSequence: [
        { label: 'Security Module Unbundled', date: 'May 10, 2026', type: 'Pricing' },
        { label: 'Free Tier Capped at 500 req/day', date: 'July 22, 2026', daysOffset: 73 },
        { label: 'Commercial Key Enforcement', date: 'August 15, 2026', daysOffset: 24 }
      ],
      similarSequenceStatement: 'Matches historical monetisation tightening pattern.',
      observedFacts: [
        'Free API quotas decreased from unlimited to 500 requests per day.',
        'Mandatory commercial key registration introduced for production.'
      ],
      aiInterpretation: 'Trend indicates shifting developer community users into contracted enterprise paying tiers.',
      whyThisMatters: 'Creates immediate displacement opportunity for open and developer-friendly alternative solutions.',
      timeRelationship: 'Unbundling → 73 days → Quota Reduction → 24 days → Commercial Enforcement',
      historicalMatchesList: [
        'Match #1: Q2 2025 (API rate limit restriction pass)',
        'Match #2: Q4 2024 (Webhooks unbundling)'
      ]
    }
  },

  // 6. UNUSUAL ACTIVITY (Competitor B)
  {
    id: 'ins-6',
    type: 'unusual',
    title: 'Aggressive Multi-Year Discount Introduction',
    competitor: 'Competitor B',
    description: '20% upfront contract discount represents an unprecedented shift from monthly SaaS models.',
    confidence: 85,
    evidenceCount: 7,
    historicalMatches: 1,
    priority: 'low',
    timeframeDays: 90,
    detectedPatternFlow: ['20% Multi-Year Discount', '50% Onboarding Fee Waiver'],
    relatedTimelineEventId: 'ev-aug12-b',
    evidenceDetails: {
      currentEvent: {
        title: 'Annual Contract Discount Shift Introduced',
        date: 'August 12, 2026',
        type: 'Pricing'
      },
      historicalSequence: [
        { label: 'Quarterly Procurement Push', date: 'August 12, 2026', type: 'Pricing' },
        { label: 'Onboarding Fee Waiver', date: 'August 20, 2026', daysOffset: 8 },
        { label: 'Enterprise Contract Outreach', date: 'September 5, 2026', daysOffset: 16 }
      ],
      similarSequenceStatement: 'Observed discount rate is double historical seasonal incentives.',
      observedFacts: [
        'Introduced 20% discount on 24-month upfront commitments.',
        'Waived implementation onboarding fees for qualifying enterprise accounts.'
      ],
      aiInterpretation: 'Unusual discounting posture may indicate pressure to lock in long-term enterprise commitments before competitor renewals.',
      whyThisMatters: 'Competitor is willing to trade margin for long-term contract lock-in, signaling defensive posture against churn.',
      timeRelationship: 'Discount Introduced → 8 days → Fee Waiver → 16 days → Sales Campaign',
      historicalMatchesList: [
        'Match #1: Q3 2024 (Annual renewal defense period)'
      ]
    }
  }
];
