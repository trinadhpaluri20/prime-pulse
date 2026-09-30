import { ChatMessage, RecentConversationItem } from '../types';

export const suggestedChatQuestions: string[] = [
  "What changed for Competitor A in the last 6 months?",
  "What patterns have been detected recently?",
  "Did Competitor A show similar behavior before?",
  "Which competitors have increasing activity?",
  "What happened after the last pricing change?",
  "Show me the evidence behind the latest insight."
];

export const mockRecentConversations: RecentConversationItem[] = [
  {
    id: 'conv-1',
    title: 'Competitor A pricing pattern',
    dateLabel: 'Today',
    previewText: 'Pricing-to-product sequence analysis and precedent matches'
  },
  {
    id: 'conv-2',
    title: 'Competitor B activity analysis',
    dateLabel: 'Yesterday',
    previewText: 'Quarterly velocity acceleration and multi-year contract discounting'
  },
  {
    id: 'conv-3',
    title: 'Six-month competitor summary',
    dateLabel: 'Sep 26',
    previewText: 'Cross-competitor signals, hiring trends, and pricing shifts'
  }
];

export const initialWelcomeMessages: ChatMessage[] = [
  {
    id: 'msg-welcome',
    role: 'assistant',
    content: "Welcome to Competitive Intern Intelligence Chat. I have indexed 184 market events and 7 recurring strategic patterns across your tracked landscape.\n\nYou can ask about specific competitor trajectories, historical precedent sequences, pricing shifts, or the evidence supporting our latest AI insights.",
    timestamp: '10:00 AM',
    summary: 'Competitive intelligence assistant ready with 6-month historical memory context.',
    keyFindings: [
      '184 competitor activity events indexed over 6 months.',
      '12 competitors actively monitored across 23 verified sources.',
      '7 recurring behavioral patterns identified with high confidence.'
    ]
  }
];

export const conversationPresets: Record<string, ChatMessage> = {
  // 1. What changed for Competitor A in the last 6 months?
  'what changed for competitor a in the last 6 months?': {
    id: 'resp-comp-a-6m',
    role: 'assistant',
    content: "Competitor A recorded 8 significant changes during the last six months. The activity included three pricing changes, two product updates, one website update, and two marketing events.\n\nThe most notable pattern was a sequence of pricing changes followed by product activity. This sequence occurred twice previously. The latest pricing change occurred on September 28.",
    timestamp: 'Just now',
    competitorContext: 'Competitor A',
    summary: "Competitor A recorded 8 significant changes during the trailing six months, primarily centered on pricing restructuring and follow-on product releases.",
    keyFindings: [
      "3 pricing adjustments across Standard, Pro, and Enterprise tiers.",
      "2 product capability releases and beta feature launches.",
      "1 landing page redesign shifting to enterprise positioning.",
      "2 marketing events and outreach campaigns."
    ],
    evidence: {
      summary: "Recurring sequence: Pricing Change → Product Update → Marketing Campaign.",
      eventsCount: 8,
      matchesCount: 2,
      confidence: 87,
      timelineEventId: 'ev-sep28-a',
      sequence: [
        { label: 'Pricing Change', date: 'September 28, 2026', type: 'Pricing' },
        { label: 'Product Update', date: 'October 6, 2026 (Projected)', type: 'Product', daysOffset: 8 },
        { label: 'Marketing Campaign', date: 'October 12, 2026 (Projected)', type: 'Marketing', daysOffset: 6 }
      ],
      observedData: [
        "Competitor A increased pricing by 12% across three plans on September 28.",
        "Two identical price-to-product sequences were recorded in June and January."
      ],
      aiInterpretation: "Historical evidence suggests that pricing restructuring serves as a preparatory operational phase before major product capability announcements."
    }
  },

  // 2. Did similar activity happen before? / Did that happen before?
  'did competitor a show similar behavior before?': {
    id: 'resp-comp-a-before',
    role: 'assistant',
    content: "Yes. Two similar sequences were identified in the available historical activity.\n\nIn both cases, a pricing change was followed by product activity within approximately 10–14 days.",
    timestamp: 'Just now',
    competitorContext: 'Competitor A',
    summary: "Historical memory confirms 2 precedent matches for the pricing-to-product sequence observed for Competitor A.",
    keyFindings: [
      "Match #1 (June 12 – June 24, 2026): Pricing restructured 12 days prior to Copilot Beta release.",
      "Match #2 (January 10 – January 24, 2026): Enterprise seat prices adjusted 14 days before SDK launch.",
      "Average latency between price shift and product update: 13.0 days."
    ],
    evidence: {
      summary: "Two historical matches verified in the 6-month historical memory bank.",
      eventsCount: 6,
      matchesCount: 2,
      confidence: 87,
      timelineEventId: 'ev-sep28-a',
      sequence: [
        { label: 'Pricing Change', date: 'June 12, 2026', type: 'Pricing' },
        { label: 'Product Update', date: 'June 24, 2026', type: 'Product', daysOffset: 12 },
        { label: 'Marketing Activity', date: 'July 2, 2026', type: 'Marketing', daysOffset: 8 }
      ],
      observedData: [
        "June 12, 2026: Standard & Pro tier adjustments logged on competitor website.",
        "June 24, 2026: General availability changelog published with enterprise documentation."
      ],
      aiInterpretation: "The recurrence of this pattern indicates a deliberate go-to-market playbook where pricing modifications precede product marketing pushes."
    }
  },

  // 3. Which competitors have increasing activity?
  'which competitors have increasing activity?': {
    id: 'resp-comp-b-increasing',
    role: 'assistant',
    content: "Competitor B has shown the largest sustained increase during the last three months, with activity approximately 34% above its earlier baseline.\n\nTotal observed signals rose from 4 events in June to 18 in late September, primarily concentrated in model inference capabilities and SDK integrations.",
    timestamp: 'Just now',
    competitorContext: 'Competitor B',
    summary: "Competitor B demonstrates the highest velocity inflection in the tracked competitive landscape over the trailing 90 days.",
    keyFindings: [
      "Monthly activity increased from 4 events in June to 14 events in September.",
      "Engineering and developer documentation updates surged by 65%.",
      "Introduced aggressive 20% discount on upfront multi-year contracts on August 12.",
      "Announced global virtual keynote summit on May 27."
    ],
    evidence: {
      summary: "18 verified activity events supporting sustained velocity ramp.",
      eventsCount: 18,
      matchesCount: 3,
      confidence: 82,
      timelineEventId: 'ev-sep25-b',
      sequence: [
        { label: 'Baseline Cadence', date: 'June 2026', type: 'Baseline' },
        { label: 'Velocity Inflection', date: 'July 2026', daysOffset: 30 },
        { label: 'Multi-Modal Surge', date: 'August – September 2026', daysOffset: 45 }
      ],
      observedData: [
        "Total signals rose steadily from 2 moves/mo to 8 moves/mo.",
        "Changelog frequency doubled across public SDK repositories."
      ],
      aiInterpretation: "Historical comparisons suggest this velocity acceleration frequently precedes a flagship product launch ahead of Q4 enterprise budgeting."
    }
  },

  // 4. What happened after the last pricing change?
  'what happened after the last pricing change?': {
    id: 'resp-after-pricing',
    role: 'assistant',
    content: "After the September 28 pricing change, a product update was detected eight days later in previous instances, followed by a targeted marketing campaign six days after that.\n\nSpecifically, Competitor A raised monthly plans by 12%. Based on historical pattern analysis, follow-on feature releases typically emerge within 8 to 14 days.",
    timestamp: 'Just now',
    competitorContext: 'Competitor A',
    summary: "Historical precedent indicates that pricing adjustments are closely linked to follow-on product releases and campaign launches.",
    keyFindings: [
      "September 28, 2026: Pricing increased by 12% across three plans.",
      "Precedent sequences indicate follow-on product release within 8–14 days.",
      "Targeted marketing campaign typically deploys within 6–8 days after product launch."
    ],
    evidence: {
      summary: "Historical sequence: Pricing Change (Sep 28) → Product Update (+8d) → Marketing Activity (+6d).",
      eventsCount: 6,
      matchesCount: 2,
      confidence: 87,
      timelineEventId: 'ev-sep28-a',
      sequence: [
        { label: 'Pricing Change', date: 'September 28, 2026', type: 'Pricing' },
        { label: 'Product Update', date: 'October 6, 2026 (Projected)', type: 'Product', daysOffset: 8 },
        { label: 'Marketing Campaign', date: 'October 12, 2026 (Projected)', type: 'Marketing', daysOffset: 6 }
      ],
      observedData: [
        "Pricing increase logged across 3 tiers on competitor website.",
        "Historical lag between pricing revision and product update averaged 11.2 days."
      ],
      aiInterpretation: "This sequence may indicate that pricing changes are often part of a broader product or marketing sequence for this competitor."
    }
  },

  // 5. What patterns have been detected recently?
  'what patterns have been detected recently?': {
    id: 'resp-patterns-recent',
    role: 'assistant',
    content: "The intelligence engine has detected 3 primary operational patterns across the competitive landscape:\n\n1. Pricing → Product Rollout (Competitor A): Pricing changes consistently precede major feature announcements by 10–14 days.\n2. Velocity Acceleration (Competitor B): Sustained 34% increase in release frequency.\n3. Developer Monetization Tightening (Competitor C): Free API caps tightened from unlimited to 500 req/day followed by infrastructure hiring expansion.",
    timestamp: 'Just now',
    summary: "7 total patterns detected, with 3 active high-confidence strategic signals requiring executive awareness.",
    keyFindings: [
      "Pattern 1: Pricing-to-Product sequence (87% confidence, Competitor A).",
      "Pattern 2: Velocity acceleration wave (82% confidence, Competitor B).",
      "Pattern 3: Developer monetization tightening & talent hiring surge (91% confidence, Competitor C)."
    ],
    evidence: {
      summary: "Correlated across 184 timeline signals and 23 intelligence sources.",
      eventsCount: 14,
      matchesCount: 7,
      confidence: 86,
      sequence: [
        { label: 'Pricing Restructure', date: 'Sep 28', type: 'Pricing' },
        { label: 'Product Preview', date: 'Sep 25', type: 'Product', daysOffset: 3 },
        { label: 'Engineering Hiring Surge', date: 'Sep 21', type: 'Hiring', daysOffset: 4 }
      ],
      observedData: [
        "3 concurrent competitors executing distinct strategic shifts in September.",
        "Zero overlap in timing suggests independent go-to-market motions."
      ],
      aiInterpretation: "Multiple competitors appear to be positioning their core platforms ahead of enterprise budget lock-in for the fiscal year."
    }
  },

  // 6. Show me the evidence behind the latest insight.
  'show me the evidence behind the latest insight.': {
    id: 'resp-evidence-latest',
    role: 'assistant',
    content: "The latest insight ('Pricing Changes Are Frequently Followed by Product Activity') is supported by 6 verified timeline events and 2 historical match sequences for Competitor A.\n\nHistorical analysis shows that prior to both the June Copilot beta and the January SDK 2.0 release, Competitor A adjusted pricing structures within a 10–14 day window.",
    timestamp: 'Just now',
    competitorContext: 'Competitor A',
    summary: "Detailed evidence dossier for the Pricing → Product sequence.",
    keyFindings: [
      "Primary Event: September 28, 2026 — 12% price increase across 3 plans.",
      "Historical Match 1: June 12 – June 24, 2026 (Enterprise tier shift preceded Copilot Beta).",
      "Historical Match 2: January 10 – January 24, 2026 (Seat price increase preceded SDK 2.0).",
      "Supporting Evidence Count: 6 events across Competitor Website and Developer Docs."
    ],
    evidence: {
      summary: "Verified historical evidence chain with 87% statistical recurrence.",
      eventsCount: 6,
      matchesCount: 2,
      confidence: 87,
      timelineEventId: 'ev-sep28-a',
      sequence: [
        { label: 'Pricing Change', date: 'September 28, 2026', type: 'Pricing' },
        { label: 'Product Update', date: 'June 24, 2026', type: 'Product', daysOffset: 12 },
        { label: 'Marketing Activity', date: 'July 2, 2026', type: 'Marketing', daysOffset: 8 }
      ],
      observedData: [
        "Event ev-sep28-a: Public pricing table modified with 12% increase.",
        "Event ev-sep15-a: Landing page redesigned with enterprise security badges."
      ],
      aiInterpretation: "The convergence of website redesign, pricing adjustment, and historical precedent strongly suggests an impending product marketing push."
    }
  }
};

// Intelligent generator for custom or context-aware queries
export function generateMockIntelligenceResponse(query: string, previousContext?: string): ChatMessage {
  const qLower = query.toLowerCase().trim();

  // 1. Direct preset match
  for (const [key, preset] of Object.entries(conversationPresets)) {
    if (qLower === key || qLower.includes(key.replace('?', ''))) {
      return {
        ...preset,
        id: `msg-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
  }

  // 2. Follow-up handling: "Did that happen before?" or "Did similar activity happen before?"
  if (qLower.includes('before') || qLower.includes('happen before') || qLower.includes('previous') || qLower.includes('that happen')) {
    const base = conversationPresets['did competitor a show similar behavior before?'];
    return {
      ...base,
      id: `msg-${Date.now()}`,
      content: `Regarding the previous activity discussed: Yes. Two similar sequences were identified in historical records.\n\nIn both instances, a pricing adjustment was followed by product release activity within approximately 10–14 days.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  // 3. Competitor A queries
  if (qLower.includes('competitor a')) {
    if (qLower.includes('pricing') || qLower.includes('price')) {
      const base = conversationPresets['what happened after the last pricing change?'];
      return {
        ...base,
        id: `msg-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
    const base = conversationPresets['what changed for competitor a in the last 6 months?'];
    return {
      ...base,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  // 4. Competitor B queries
  if (qLower.includes('competitor b')) {
    const base = conversationPresets['which competitors have increasing activity?'];
    return {
      ...base,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  // 5. Competitor C queries
  if (qLower.includes('competitor c')) {
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: "Competitor C has exhibited an unusual activity spike concentrated in engineering recruitment and API monetization tightening.\n\nOn September 21, five senior infrastructure roles were posted simultaneously. This follows the unbundling of security modules in May and developer rate limit caps in July.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      competitorContext: 'Competitor C',
      summary: "Competitor C is accelerating developer monetization enforcement while scaling foundational infrastructure teams.",
      keyFindings: [
        "5 senior engineering positions posted on September 21 (+240% above baseline).",
        "Free API rate limits capped at 500 requests/day on July 22.",
        "SOC2 and SSO compliance features unbundled into paid tiers on May 10."
      ],
      evidence: {
        summary: "Sequential tightening: Security Unbundle → API Capping → Talent Expansion.",
        eventsCount: 11,
        matchesCount: 1,
        confidence: 91,
        timelineEventId: 'ev-sep21-c',
        sequence: [
          { label: 'Security Module Unbundled', date: 'May 10, 2026', type: 'Pricing' },
          { label: 'API Developer Rate Limits', date: 'July 22, 2026', daysOffset: 73 },
          { label: 'Infrastructure Roles Posted', date: 'September 21, 2026', daysOffset: 61 }
        ],
        observedData: [
          "5 simultaneous job listings on careers page for vector search and streaming pipelines.",
          "Updated terms of service restricting high-volume free tier usage."
        ],
        aiInterpretation: "This cluster of infrastructure hiring paired with developer quota restrictions frequently indicates preparations for enterprise monetization enforcement."
      }
    };
  }

  // 6. Generic Fallback Intelligence Synthesis
  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: `Based on 184 historical events and verified market signals for "${query}":\n\nTracked competitive intelligence indicates proactive positioning across product roadmaps and pricing structures. Historical comparisons show competitors adjusting entry-level tiers ahead of upcoming enterprise procurement cycles.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    summary: `Synthesized intelligence for query: "${query}".`,
    keyFindings: [
      "Correlated signals observed across 3 primary competitors in the trailing 90 days.",
      "Pricing compression observed in entry tiers with high-end enterprise unbundling.",
      "Developer hiring signals indicate expanding investments in autonomous workflows."
    ],
    evidence: {
      summary: "Correlated across verified historical intelligence records.",
      eventsCount: 7,
      matchesCount: 2,
      confidence: 84,
      timelineEventId: 'ev-sep28-a',
      sequence: [
        { label: 'Market Observation', date: 'Trailing 30 days', type: 'Signal' },
        { label: 'Historical Precedent', date: 'Earlier Quarter', daysOffset: 45 },
        { label: 'Follow-on Motion', date: 'Projected', daysOffset: 14 }
      ],
      observedData: [
        "Verified timeline records indicate consistent seasonal cadence shifts.",
        "Changelogs confirm accelerated developer tooling releases."
      ],
      aiInterpretation: "Historical data suggests current competitor moves are aligned with broader industry roadmap execution rather than isolated anomalies."
    }
  };
}
