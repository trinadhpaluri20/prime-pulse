import { 
  Competitor, 
  ActivityEvent, 
  SmartAlert, 
  StrategicInsight, 
  ChatMessage, 
  KPIStat, 
  SystemStatus, 
  UserProfile 
} from '../types';

export const mockUserProfile: UserProfile = {
  name: 'Alex Vance',
  email: 'a.vance@competitiveintern.ai',
  role: 'Principal Strategy Analyst',
  initials: 'AV'
};

export const mockSystemStatus: SystemStatus = {
  hindsightConnected: true,
  postgresConnected: true,
  groqConnected: true,
  memoryRetentionRate: '99.8%',
  activeMemoryDocuments: 342,
  lastSyncedAt: 'Just now'
};

export const mockCompetitors: Competitor[] = [
  {
    id: 1,
    name: 'Acme AI Systems',
    website: 'https://acmeai.io',
    industry: 'Enterprise Agentic AI',
    description: 'Leading platform providing enterprise workflow automation and autonomous agents.',
    tier: 'Tier 1 - Primary',
    threatLevel: 'high',
    techStack: ['Python', 'Rust', 'PyTorch', 'PostgreSQL', 'Kubernetes'],
    activeSignalsCount: 28,
    lastActive: '2 hours ago'
  },
  {
    id: 2,
    name: 'Microsoft AI Cloud',
    website: 'https://azure.microsoft.com/ai',
    industry: 'Cloud Infrastructure & Foundation Models',
    description: 'Hyperscaler enterprise AI offerings, Copilot suites, and model hosting ecosystems.',
    tier: 'Tier 1 - Primary',
    threatLevel: 'high',
    techStack: ['Azure', 'OpenAI', 'C#', 'TypeScript', 'CosmosDB'],
    activeSignalsCount: 45,
    lastActive: '5 hours ago'
  },
  {
    id: 3,
    name: 'Synthesia Intelligence',
    website: 'https://synthesiaintel.com',
    industry: 'Multimodal Generative Media',
    description: 'B2B synthetic media, interactive avatars, and visual video generation models.',
    tier: 'Tier 2 - Emerging',
    threatLevel: 'medium',
    techStack: ['PyTorch', 'WebRTC', 'FastAPI', 'Next.js'],
    activeSignalsCount: 14,
    lastActive: 'Yesterday'
  },
  {
    id: 4,
    name: 'Cognitive Nexus Labs',
    website: 'https://cognitivenexus.tech',
    industry: 'Specialized Enterprise RAG & Memory',
    description: 'Specialized vector search, graph-based RAG engines, and long-term memory sidecars.',
    tier: 'Tier 2 - Emerging',
    threatLevel: 'medium',
    techStack: ['Go', 'Rust', 'Milvus', 'Qdrant'],
    activeSignalsCount: 19,
    lastActive: '3 days ago'
  }
];

export const mockKPICards: KPIStat[] = [
  {
    id: 'kpi-1',
    label: 'Tracked Competitors',
    value: 4,
    change: '+1 this month',
    isPositiveChange: true,
    subtext: 'Across 2 primary market tiers',
    category: 'competitors'
  },
  {
    id: 'kpi-2',
    label: 'Market Signals Ingested',
    value: 106,
    change: '+24% velocity',
    isPositiveChange: true,
    subtext: 'Dual-persisted in historical memory',
    category: 'signals'
  },
  {
    id: 'kpi-3',
    label: 'Memory Provenance Docs',
    value: 342,
    change: 'Zero hallucination',
    isPositiveChange: true,
    subtext: 'Vector & relational indexed records',
    category: 'memory'
  },
  {
    id: 'kpi-4',
    label: 'Active Threat Alerts',
    value: 3,
    change: '2 Critical items',
    isPositiveChange: false,
    subtext: 'Requires strategic countermeasure',
    category: 'threats'
  }
];

export const mockActivityEvents: ActivityEvent[] = [
  {
    id: 'ev-1',
    competitorId: 1,
    competitorName: 'Acme AI Systems',
    title: 'Reduced Pro Tier Pricing by 25% with Unlimited API Usage',
    description: 'Acme restructured subscription plans, lowering Pro seat cost from $49/mo to $36.75/mo while unbundling dedicated support fees.',
    category: 'pricing',
    importance: 'critical',
    eventDate: '2026-09-29T18:30:00Z',
    previousValue: '$49 / user / month',
    newValue: '$36.75 / user / month',
    sourceUrl: 'https://acmeai.io/pricing',
    sourceName: 'Pricing Page Changelog',
    memoryDocId: 'event-1-pricing-drop-q3'
  },
  {
    id: 'ev-2',
    competitorId: 2,
    competitorName: 'Microsoft AI Cloud',
    title: 'Hired Former AWS Vice President of Enterprise Cloud Sales',
    description: 'Executive appointment of Sarah Jenkins to accelerate global Fortune 500 AI agent deployments in Europe and APAC.',
    category: 'leadership',
    importance: 'high',
    eventDate: '2026-09-28T14:15:00Z',
    previousValue: 'VP Sales (Interim)',
    newValue: 'Sarah Jenkins (Former AWS Exec)',
    sourceUrl: 'https://linkedin.com/posts/microsoft-enterprise',
    sourceName: 'Executive Announcement',
    memoryDocId: 'event-2-vp-sales-hire'
  },
  {
    id: 'ev-3',
    competitorId: 1,
    competitorName: 'Acme AI Systems',
    title: 'Launched Copilot Agent Studio v2 with Persistent Memory',
    description: 'Released multi-agent orchestration console featuring long-term memory retain/recall and autonomous webhook triggers.',
    category: 'product',
    importance: 'high',
    eventDate: '2026-09-26T09:00:00Z',
    sourceUrl: 'https://acmeai.io/blog/copilot-v2-release',
    sourceName: 'Product Release Blog',
    memoryDocId: 'event-1-copilot-studio-v2'
  },
  {
    id: 'ev-4',
    competitorId: 4,
    competitorName: 'Cognitive Nexus Labs',
    title: 'Closed $42M Series B Funding Led by Sequoia Horizon',
    description: 'Capital injected for European expansion and localized on-premise sovereign memory bank deployments.',
    category: 'funding',
    importance: 'medium',
    eventDate: '2026-09-24T11:45:00Z',
    previousValue: '$12M Series A',
    newValue: '$42M Series B',
    sourceUrl: 'https://techcrunch.com/cognitive-nexus-series-b',
    sourceName: 'TechCrunch',
    memoryDocId: 'event-4-series-b-round'
  },
  {
    id: 'ev-5',
    competitorId: 3,
    competitorName: 'Synthesia Intelligence',
    title: 'Announced Global Partnership with Salesforce Marketing Cloud',
    description: 'Integration allows automatic generation of targeted personalized video campaigns directly inside Salesforce journey builder.',
    category: 'partnership',
    importance: 'medium',
    eventDate: '2026-09-22T16:20:00Z',
    sourceUrl: 'https://synthesiaintel.com/press/salesforce-partner',
    sourceName: 'Press Release',
    memoryDocId: 'event-3-salesforce-partnership'
  },
  {
    id: 'ev-6',
    competitorId: 1,
    competitorName: 'Acme AI Systems',
    title: 'Posted 14 Open Positions in Enterprise Security & HIPAA Compliance',
    description: 'Hiring blitz targeting healthcare and life science compliance officers indicates an upcoming regulated industry market pivot.',
    category: 'hiring',
    importance: 'high',
    eventDate: '2026-09-19T13:00:00Z',
    sourceUrl: 'https://acmeai.io/careers',
    sourceName: 'Careers Page Scraper',
    memoryDocId: 'event-1-healthcare-hiring-blitz'
  }
];

export const mockSmartAlerts: SmartAlert[] = [
  {
    id: 'alt-1',
    competitorId: 1,
    competitorName: 'Acme AI Systems',
    title: 'Aggressive 25% Price Reduction on Core Enterprise Tier',
    description: 'Acme lowered monthly per-seat commitment to undercut mid-market competitors. Potential pressure on our Q4 renewal contracts.',
    category: 'pricing',
    severity: 'critical',
    createdAt: '2026-09-29T18:30:00Z',
    isAcknowledged: false,
    actionRequired: 'Review pricing defense battlecard and notify enterprise GTM leads.',
    memoryDocId: 'event-1-pricing-drop-q3'
  },
  {
    id: 'alt-2',
    competitorId: 2,
    competitorName: 'Microsoft AI Cloud',
    title: 'Executive Poaching: Former AWS VP of Sales Recruited',
    description: 'New leadership aims to capture tier-1 cloud migrations and enterprise agent contracts across EMEA.',
    category: 'leadership',
    severity: 'high',
    createdAt: '2026-09-28T14:15:00Z',
    isAcknowledged: false,
    actionRequired: 'Evaluate account overlap in EMEA enterprise sector.',
    memoryDocId: 'event-2-vp-sales-hire'
  },
  {
    id: 'alt-3',
    competitorId: 1,
    competitorName: 'Acme AI Systems',
    title: 'Strategic Hiring Surge Detected: Regulated Healthcare Sector',
    description: '14 compliance and security roles posted in 72 hours. Signals an imminent launch into HIPAA/FDA compliance markets.',
    category: 'hiring',
    severity: 'high',
    createdAt: '2026-09-19T13:00:00Z',
    isAcknowledged: false,
    actionRequired: 'Assess our healthcare feature roadmap and accelerate compliance certifications.',
    memoryDocId: 'event-1-healthcare-hiring-blitz'
  },
  {
    id: 'alt-4',
    competitorId: 4,
    competitorName: 'Cognitive Nexus Labs',
    title: '$42M Series B Closes — War Chest Allocated for On-Premise Memory',
    description: 'Significant capital boost increases their capability to bid on sovereign banking and defense contracts.',
    category: 'funding',
    severity: 'medium',
    createdAt: '2026-09-24T11:45:00Z',
    isAcknowledged: true,
    actionRequired: 'Monitor RFP announcements in federal and banking sectors.',
    memoryDocId: 'event-4-series-b-round'
  }
];

export const mockInsights: StrategicInsight[] = [
  {
    id: 'ins-1',
    competitorId: 1,
    competitorName: 'Acme AI Systems',
    title: 'Pricing Compression & Downmarket Land-and-Expand Strategy',
    type: 'pattern',
    summary: 'Acme has systematically shifted from high-touch enterprise sales to an aggressive product-led downmarket growth engine over the last 90 days.',
    facts: [
      'FACT [2026-09-29]: Slashed Pro tier pricing by 25% ($49 to $36.75/seat).',
      'FACT [2026-09-26]: Released self-serve Copilot Studio v2 without mandatory onboarding.'
    ],
    observations: [
      'OBSERVATION: Shorter sales cycles intended to saturate SMB developers before enterprise renewal season.',
      'OBSERVATION: Support unbundling creates hidden monetization through professional services add-ons.'
    ],
    implications: [
      'Counter with value-based bundled guarantees (SLAs + dedicated agent support).',
      'Highlight total cost of ownership (TCO) advantage over unbundled hidden fees.'
    ],
    confidenceScore: 94,
    detectedAt: '2026-09-29T19:00:00Z',
    category: 'pricing',
    citations: ['event-1-pricing-drop-q3', 'event-1-copilot-studio-v2']
  },
  {
    id: 'ins-2',
    competitorId: 1,
    competitorName: 'Acme AI Systems',
    title: 'Imminent Market Pivot into Regulated Healthcare Enterprise',
    type: 'prediction',
    summary: 'Correlation between 14 HIPAA/compliance job openings and recent security whitepaper releases indicates a formal healthcare offering in Q4.',
    facts: [
      'FACT [2026-09-19]: 14 job openings posted for HIPAA Security Officers and Healthcare Interop Engineers.',
      'FACT [2026-09-05]: Updated SOC2 Type II audit to include BAA agreements.'
    ],
    observations: [
      'OBSERVATION: Competitor is seeking high-margin regulated enterprise contracts to offset lower Pro tier pricing.',
      'OBSERVATION: Talent acquired primarily from Epic Systems and Cerner alumni.'
    ],
    implications: [
      'Pre-empt announcement by showcasing our established FDA/HIPAA compliance case studies.',
      'Engage strategic healthcare design partners to lock in multi-year commitments.'
    ],
    confidenceScore: 89,
    detectedAt: '2026-09-25T14:30:00Z',
    category: 'hiring',
    citations: ['event-1-healthcare-hiring-blitz']
  },
  {
    id: 'ins-3',
    competitorId: 2,
    competitorName: 'Microsoft AI Cloud',
    title: 'Aggressive EMEA Enterprise Migration Push',
    type: 'threat',
    summary: 'Appointment of former AWS VP of Enterprise Sales signals intensified pressure on Fortune 500 European cloud accounts.',
    facts: [
      'FACT [2026-09-28]: Hired former AWS enterprise lead Sarah Jenkins.',
      'FACT [2026-09-12]: Opened localized sovereign Frankfurt and Zurich model hosting clusters.'
    ],
    observations: [
      'OBSERVATION: Targeting EU data residency requirements to unseat US-centric AI SaaS providers.',
      'OBSERVATION: Enterprise bundling with existing Azure E5 enterprise agreements.'
    ],
    implications: [
      'Reinforce multi-cloud portability and zero vendor lock-in messaging.',
      'Highlight our localized memory sovereign deployment capabilities.'
    ],
    confidenceScore: 92,
    detectedAt: '2026-09-28T16:00:00Z',
    category: 'leadership',
    citations: ['event-2-vp-sales-hire']
  }
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content: "Welcome to Competitive Intern AI Chat. I have direct persistent memory access across all tracked competitors, pricing models, release histories, and executive movements.\n\nHow can I support your strategic analysis today?",
    timestamp: '10:00 AM',
    facts: [
      'Historical memory bank connected with 342 indexed intelligence documents.',
      'AI reasoning engine active with zero-hallucination grounding.'
    ],
    observations: [
      'Recent critical events detected for Acme AI Systems (pricing reduction) and Microsoft AI (executive hire).'
    ]
  },
  {
    id: 'msg-2',
    role: 'user',
    content: "Summarize Acme AI's pricing strategy shifts and what they mean for our upcoming renewal cycle.",
    timestamp: '10:02 AM',
    competitorContext: 'Acme AI Systems'
  },
  {
    id: 'msg-3',
    role: 'assistant',
    content: "Acme AI Systems executed a notable strategic pivot on September 29, 2026, reducing their Pro Tier from $49/mo to $36.75/mo (-25%) with unlimited API usage.\n\nOur historical memory indicates this is their first baseline price reduction in 18 months, intended to accelerate developer adoption ahead of Q4 enterprise budgeting cycles.",
    timestamp: '10:02 AM',
    competitorContext: 'Acme AI Systems',
    facts: [
      'FACT [2026-09-29]: Pro tier reduced from $49 to $36.75 per seat per month.',
      'FACT [2026-09-29]: Dedicated enterprise support was decoupled and moved to a paid add-on ($2,500/mo).'
    ],
    observations: [
      'OBSERVATION: The headline 25% discount is offset for mid-to-large customers by the unbundled support fee.',
      'OBSERVATION: Accounts requiring strict SLAs and dedicated enterprise engineers will experience an effective net cost increase.'
    ],
    citations: ['event-1-pricing-drop-q3']
  }
];
