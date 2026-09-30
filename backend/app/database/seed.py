"""
Seed database script for Competitive Intern.
Populates realistic demo data spanning 6 months:
- 4 competitors
- 34 activities
- 6 sources
- 7 insights with rich evidence sequence metadata
- 5 smart alerts
"""

import json
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database.connection import engine
from app.db.base import Base
from app.models.competitor import Competitor
from app.models.source import Source
from app.models.activity import Activity
from app.models.insight import Insight
from app.models.alert import Alert


def seed_database(reset: bool = True):
    """Initializes tables and seeds initial realistic intelligence data."""
    if reset:
        print("Dropping existing tables to align schema...")
        Base.metadata.drop_all(bind=engine)

    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)

    with Session(engine) as session:

        print("Seeding Competitors...")
        comp_a = Competitor(
            name="Competitor A",
            website="https://competitor-a.ai",
            description="Tier 1 enterprise AI intelligence & agentic platform provider.",
            status="active",
            industry="Enterprise AI",
        )
        comp_b = Competitor(
            name="Competitor B",
            website="https://competitor-b.dev",
            description="Developer intelligence, context engine, and workflow copilot suite.",
            status="active",
            industry="Developer Tools",
        )
        comp_c = Competitor(
            name="Competitor C",
            website="https://competitor-c.org",
            description="High-performance open weights and low-latency inference framework.",
            status="active",
            industry="AI Infrastructure",
        )
        comp_d = Competitor(
            name="Competitor D",
            website="https://competitor-d.io",
            description="Autonomous multi-agent cloud orchestration challenger.",
            status="active",
            industry="Cloud Agents",
        )

        session.add_all([comp_a, comp_b, comp_c, comp_d])
        session.commit()
        for c in (comp_a, comp_b, comp_c, comp_d):
            session.refresh(c)

        print("Seeding Sources...")
        src_a_pricing = Source(
            name="Competitor A Pricing Page",
            url="https://competitor-a.ai/pricing",
            source_type="product_page",
        )
        src_a_careers = Source(
            name="Competitor A Greenhouse Board",
            url="https://competitor-a.ai/careers",
            source_type="careers",
        )
        src_b_docs = Source(
            name="Competitor B Documentation Hub",
            url="https://competitor-b.dev/docs",
            source_type="product_page",
        )
        src_b_blog = Source(
            name="Competitor B Engineering Blog",
            url="https://competitor-b.dev/blog",
            source_type="news",
        )
        src_c_repo = Source(
            name="Competitor C Open Source Releases",
            url="https://competitor-c.org/releases",
            source_type="website",
        )
        src_d_site = Source(
            name="Competitor D Official Landing Page",
            url="https://competitor-d.io",
            source_type="website",
        )

        session.add_all(
            [src_a_pricing, src_a_careers, src_b_docs, src_b_blog, src_c_repo, src_d_site]
        )
        session.commit()
        for s in (src_a_pricing, src_a_careers, src_b_docs, src_b_blog, src_c_repo, src_d_site):
            session.refresh(s)

        print("Seeding Activities across 6-month historical timeline...")
        base_now = datetime.now(timezone.utc)

        raw_activities = [
            # Competitor A (Sequential Pattern: Pricing -> Hiring -> Website -> Product -> Marketing)
            {
                "comp": comp_a,
                "src": src_a_pricing,
                "type": "pricing",
                "title": "Enterprise Base Plan Restructured with 18% Volume Discount",
                "desc": "Lowered enterprise base contract minimum by 18% with mandatory annual commitment clause.",
                "importance": "high",
                "days_ago": 2,
                "meta": {
                    "fullDescription": "Lowered enterprise base contract minimum by 18% with mandatory annual commitment clause. Represents aggressive enterprise customer acquisition posture.",
                    "detectedChanges": ["Base contract minimum reduced from $24,000/yr to $19,500/yr", "Added annual commitment mandate"],
                    "historical_context": {
                        "summary": "Exact historical precursor pattern observed prior to their 2025 v1 platform launch.",
                        "similarCount": 3,
                        "sequence": [
                            {"label": "Enterprise price reduction (-18%)", "daysOffset": -45},
                            {"label": "4 senior distributed systems engineer requisitions", "daysOffset": -30},
                            {"label": "Full platform release announced", "daysOffset": 0}
                        ]
                    }
                }
            },
            {
                "comp": comp_a,
                "src": src_a_careers,
                "type": "hiring",
                "title": "Posted 4 Lead Distributed Systems & LLM Fine-Tuning Roles",
                "desc": "Opened senior engineering requisitions focusing on low-latency inference clustering.",
                "importance": "high",
                "days_ago": 15,
                "meta": {"detectedChanges": ["4 new job postings in San Francisco & Remote"]}
            },
            {
                "comp": comp_a,
                "src": src_d_site,
                "type": "website",
                "title": "Updated Homepage Teasing 'Autonomous Agent Swarms'",
                "desc": "Headline changed from 'Enterprise Copilot' to 'Autonomous AI Workforce Solutions'.",
                "importance": "medium",
                "days_ago": 32,
                "meta": {"detectedChanges": ["Hero headline update", "Removed legacy 'copilot' branding"]}
            },
            {
                "comp": comp_a,
                "src": src_a_pricing,
                "type": "product",
                "title": "Private Beta API Launched for Agent Orchestration v2",
                "desc": "Released closed beta endpoints with streaming tool-execution telemetry.",
                "importance": "high",
                "days_ago": 58,
                "meta": {"detectedChanges": ["API v2 documentation pushed to staging"]}
            },
            {
                "comp": comp_a,
                "src": src_b_blog,
                "type": "marketing",
                "title": "Keynote Sponsorship Announced for Fall AI Summit",
                "desc": "Secured diamond tier sponsorship with 45-minute keynote slot on enterprise agents.",
                "importance": "medium",
                "days_ago": 80,
                "meta": {"detectedChanges": ["Event banner added"]}
            },
            {
                "comp": comp_a,
                "src": src_a_pricing,
                "type": "pricing",
                "title": "Discontinued Legacy Starter Tier",
                "desc": "Phased out $29/mo individual tier, redirecting all users to Teams ($79/user/mo).",
                "importance": "medium",
                "days_ago": 115,
                "meta": {"detectedChanges": ["Starter tier removed from pricing matrix"]}
            },
            {
                "comp": comp_a,
                "src": src_a_careers,
                "type": "hiring",
                "title": "Hired Former DeepMind Research Scientist as VP of Intelligence",
                "desc": "Strategic executive appointment leading agent reasoning architectures.",
                "importance": "high",
                "days_ago": 140,
                "meta": {"detectedChanges": ["Executive leadership page update"]}
            },
            {
                "comp": comp_a,
                "src": src_d_site,
                "type": "website",
                "title": "Overhauled Security & Compliance Portal with SOC2 Type II",
                "desc": "Added self-service security audit download center for enterprise buyers.",
                "importance": "low",
                "days_ago": 165,
                "meta": {"detectedChanges": ["Trust center launched"]}
            },

            # Competitor B
            {
                "comp": comp_b,
                "src": src_b_docs,
                "type": "product",
                "title": "Released Multi-Turn Context Caching for SDK v4",
                "desc": "Context caching protocol reduces token latency by up to 68% for repeat prompts.",
                "importance": "high",
                "days_ago": 6,
                "meta": {"detectedChanges": ["SDK v4.2.0 changelog published"]}
            },
            {
                "comp": comp_b,
                "src": src_b_docs,
                "type": "website",
                "title": "Scrubbed Deprecated Legacy REST Endpoints from Docs",
                "desc": "Removed 14 legacy endpoints from public API reference without transition guide.",
                "importance": "medium",
                "days_ago": 18,
                "meta": {"detectedChanges": ["API reference diff shows 14 deletions"]}
            },
            {
                "comp": comp_b,
                "src": src_b_blog,
                "type": "marketing",
                "title": "Published Benchmark Showing 2x Speedup Over Competitor A",
                "desc": "Viral blog post comparing code completion latency across popular IDE plugins.",
                "importance": "medium",
                "days_ago": 41,
                "meta": {"detectedChanges": ["Benchmark blog post published"]}
            },
            {
                "comp": comp_b,
                "src": src_a_pricing,
                "type": "pricing",
                "title": "Introduced Prepaid Inference Token Credit Packs",
                "desc": "Rolled out non-expiring credit bundles with tier pricing down to $0.40/M tokens.",
                "importance": "high",
                "days_ago": 65,
                "meta": {"detectedChanges": ["New pricing tab for Token Packs"]}
            },
            {
                "comp": comp_b,
                "src": src_a_careers,
                "type": "hiring",
                "title": "Opened 6 Enterprise Account Executive Roles in EMEA",
                "desc": "Signaling rapid international go-to-market enterprise expansion.",
                "importance": "medium",
                "days_ago": 92,
                "meta": {"detectedChanges": ["EMEA sales positions listed"]}
            },
            {
                "comp": comp_b,
                "src": src_b_docs,
                "type": "product",
                "title": "Launched Local On-Device Inference for VS Code Extension",
                "desc": "Enables completely offline completion using 3B quantized local weights.",
                "importance": "high",
                "days_ago": 128,
                "meta": {"detectedChanges": ["VS Code marketplace extension v3.0 update"]}
            },
            {
                "comp": comp_b,
                "src": src_d_site,
                "type": "website",
                "title": "Interactive Playground Redesigned with Real-time Trace Inspector",
                "desc": "Inspect raw prompt tokens, latencies, and tool call invocations live in browser.",
                "importance": "low",
                "days_ago": 155,
                "meta": {"detectedChanges": ["Playground UI redesign"]}
            },
            {
                "comp": comp_b,
                "src": src_a_pricing,
                "type": "pricing",
                "title": "Raised Free Tier Rate Limit from 20 to 50 req/min",
                "desc": "Doubled developer tier throughput to stimulate platform ecosystem adoption.",
                "importance": "low",
                "days_ago": 172,
                "meta": {"detectedChanges": ["Rate limit doc change"]}
            },

            # Competitor C
            {
                "comp": comp_c,
                "src": src_c_repo,
                "type": "product",
                "title": "Released 70B Parameter Quantized Model Weights",
                "desc": "Apache 2.0 release matching proprietary performance on reasoning benchmarks.",
                "importance": "high",
                "days_ago": 9,
                "meta": {"detectedChanges": ["HuggingFace and GitHub repository release"]}
            },
            {
                "comp": comp_c,
                "src": src_a_pricing,
                "type": "pricing",
                "title": "Slashed Managed Fine-Tuning Service Prices by 35%",
                "desc": "Direct response to competitor cloud offerings, lowering barrier for bespoke model hosting.",
                "importance": "high",
                "days_ago": 26,
                "meta": {"detectedChanges": ["Fine-tuning rates lowered"]}
            },
            {
                "comp": comp_c,
                "src": src_b_blog,
                "type": "marketing",
                "title": "Published Technical Whitepaper on Speculative Decoding",
                "desc": "Co-authored research with leading university demonstrating 3.2x inference speedup.",
                "importance": "medium",
                "days_ago": 48,
                "meta": {"detectedChanges": ["PDF technical report published"]}
            },
            {
                "comp": comp_c,
                "src": src_a_careers,
                "type": "hiring",
                "title": "Recruited 3 Compiler Optimization Specialists",
                "desc": "Targeting custom CUDA kernel development and TPU accelerator support.",
                "importance": "medium",
                "days_ago": 73,
                "meta": {"detectedChanges": ["Low-level systems engineering postings"]}
            },
            {
                "comp": comp_c,
                "src": src_d_site,
                "type": "website",
                "title": "Launched Unified Model Evaluation Dashboard",
                "desc": "Public arena tracking benchmark accuracy across 20+ automated evaluation suites.",
                "importance": "low",
                "days_ago": 105,
                "meta": {"detectedChanges": ["Public eval arena deployed"]}
            },
            {
                "comp": comp_c,
                "src": src_c_repo,
                "type": "product",
                "title": "Shipped Continuous Batching Engine for Model Serving",
                "desc": "High-throughput serving architecture optimizing GPU VRAM utilization.",
                "importance": "high",
                "days_ago": 135,
                "meta": {"detectedChanges": ["v0.8 engine release tagged"]}
            },
            {
                "comp": comp_c,
                "src": src_a_pricing,
                "type": "pricing",
                "title": "Introduced Free Academic Research Tier",
                "desc": "Provides vetted university labs with $5,000 monthly cloud inference credits.",
                "importance": "low",
                "days_ago": 160,
                "meta": {"detectedChanges": ["Academic portal live"]}
            },

            # Competitor D
            {
                "comp": comp_d,
                "src": src_d_site,
                "type": "marketing",
                "title": "Announced Strategic Hyperscaler Cloud Partnership",
                "desc": "Designated as premier multi-agent orchestration solution on marketplace.",
                "importance": "high",
                "days_ago": 4,
                "meta": {"detectedChanges": ["Joint press release distributed"]}
            },
            {
                "comp": comp_d,
                "src": src_b_docs,
                "type": "product",
                "title": "Private Beta for Multi-Agent Collaboration Framework",
                "desc": "Allows hierarchical agent swarms with shared state and autonomous task handoffs.",
                "importance": "high",
                "days_ago": 22,
                "meta": {"detectedChanges": ["Beta developer documentation published"]}
            },
            {
                "comp": comp_d,
                "src": src_a_careers,
                "type": "hiring",
                "title": "Posted Head of Developer Relations & Community",
                "desc": "Expanding hackathon and ecosystem sponsorship footprint globally.",
                "importance": "medium",
                "days_ago": 51,
                "meta": {"detectedChanges": ["DevRel leader req published"]}
            },
            {
                "comp": comp_d,
                "src": src_d_site,
                "type": "website",
                "title": "Updated Privacy Policy with Explicit Zero-Data Retention Guarantee",
                "desc": "Customer inputs and prompt logs are never used for model training.",
                "importance": "medium",
                "days_ago": 87,
                "meta": {"detectedChanges": ["Privacy policy revision timestamped"]}
            },
            {
                "comp": comp_d,
                "src": src_a_pricing,
                "type": "pricing",
                "title": "Doubled Daily Free Tier Token Allowance to 100k",
                "desc": "Lowering friction for hobbyist developers building agentic workflows.",
                "importance": "low",
                "days_ago": 110,
                "meta": {"detectedChanges": ["Free tier limits updated"]}
            },
            {
                "comp": comp_d,
                "src": src_b_docs,
                "type": "product",
                "title": "Launched Zapier and Webhook Automation Integrations",
                "desc": "Native connectivity to 2,000+ business applications for event-triggered agent execution.",
                "importance": "medium",
                "days_ago": 138,
                "meta": {"detectedChanges": ["Integration ecosystem page added"]}
            },
            {
                "comp": comp_d,
                "src": src_a_careers,
                "type": "hiring",
                "title": "Hired Staff Security Engineer for SOC2 Type II Certification",
                "desc": "Targeting enterprise compliance audit milestone within 90 days.",
                "importance": "medium",
                "days_ago": 168,
                "meta": {"detectedChanges": ["Security team hire"]}
            },

            # Additional chronological activities to exceed 30 items
            {
                "comp": comp_a,
                "src": src_a_pricing,
                "type": "pricing",
                "title": "Annual Billing Option Added with 2 Months Free Incentive",
                "desc": "Incentivizing upfront cash collection across mid-market enterprise accounts.",
                "importance": "low",
                "days_ago": 178,
                "meta": {"detectedChanges": ["Annual toggle switch added to checkout"]}
            },
            {
                "comp": comp_b,
                "src": src_b_blog,
                "type": "marketing",
                "title": "Quarterly Developer Community Town Hall Broadcast",
                "desc": "CEO unveiled sneak preview of autonomous multi-agent debugger.",
                "importance": "medium",
                "days_ago": 14,
                "meta": {"detectedChanges": ["YouTube livestream recording posted"]}
            },
        ]

        activities_to_insert = []
        for item in raw_activities:
            det_date = base_now - timedelta(days=item["days_ago"])
            act = Activity(
                competitor_id=item["comp"].id,
                source_id=item["src"].id,
                activity_type=item["type"],
                title=item["title"],
                description=item["desc"],
                importance=item["importance"],
                detected_at=det_date,
                metadata_json=json.dumps(item.get("meta", {})),
            )
            activities_to_insert.append(act)

        session.add_all(activities_to_insert)
        session.commit()

        print("Seeding 7 AI Strategic Insights...")
        insights_data = [
            {
                "type": "pattern",
                "title": "Precursor Signal: Pricing discount precedes major platform release",
                "desc": "Correlating Competitor A's recent 18% enterprise pricing discount with 4 senior distributed systems hiring requisitions matches historical release cycles.",
                "comp": comp_a,
                "conf": 0.94,
                "ev_count": 5,
                "prio": "high",
                "tf": 45,
                "evidence_data": {
                    "detectedPatternFlow": ["18% Enterprise Discount", "4 LLM Infra Postings", "Landing Page Relaunch", "Autonomous Agent Launch"],
                    "evidenceDetails": {
                        "currentEvent": {"title": "Enterprise Base Plan Restructured", "date": "Sep 28, 2026", "type": "Pricing"},
                        "historicalSequence": [
                            {"label": "Enterprise price reduction (-18%)", "date": "Sep 28, 2026", "type": "Pricing", "daysOffset": -2},
                            {"label": "4 senior distributed systems engineer requisitions", "date": "Sep 15, 2026", "type": "Hiring", "daysOffset": -15},
                            {"label": "Homepage updated teasing agent swarms", "date": "Aug 29, 2026", "type": "Website", "daysOffset": -32},
                            {"label": "Private Beta API launched for Agent v2", "date": "Aug 03, 2026", "type": "Product", "daysOffset": -58}
                        ],
                        "similarSequenceStatement": "94% historical pattern fidelity matching their 2025 v1 flagship platform launch sequence.",
                        "observedFacts": [
                            "Base contract minimum decreased from $24,000 to $19,500 with annual commitment mandate.",
                            "Greenhouse portal shows 4 new distributed systems roles targeting low-latency clustering.",
                            "Headline changed from 'Enterprise Copilot' to 'Autonomous AI Workforce Solutions'."
                        ],
                        "aiInterpretation": "Competitor A is aggressively lowering upfront friction to lock in enterprise contract renewals prior to unveiling their autonomous agent suite in Q4.",
                        "whyThisMatters": "Our sales team must anticipate bundled discount proposals during upcoming Q4 enterprise renewal negotiations.",
                        "timeRelationship": "Historic mean lead-time between pricing restructuring and full launch is 14–21 days.",
                        "historicalMatchesList": ["Q4 2025 v1 Launch Sequence", "Q2 2025 Teams Expansion", "Q1 2026 Cloud API Launch"]
                    }
                }
            },
            {
                "type": "trend",
                "title": "Accelerated Hiring in Enterprise Infrastructure & Compliance",
                "desc": "Both Competitor A and Competitor D have opened key executive and security roles targeting enterprise SOC2 Type II compliance.",
                "comp": comp_a,
                "conf": 0.89,
                "ev_count": 4,
                "prio": "high",
                "tf": 60,
                "evidence_data": {
                    "detectedPatternFlow": ["Staff Security Req", "Trust Portal Launch", "Enterprise RFP Target"],
                    "evidenceDetails": {
                        "currentEvent": {"title": "Overhauled Security & Compliance Portal", "date": "Sep 10, 2026", "type": "Website"},
                        "observedFacts": ["Security certifications prominently displayed in top navigation."],
                        "aiInterpretation": "Direct preparation for financial services and healthcare enterprise procurement cycles.",
                        "whyThisMatters": "Enterprise compliance barriers are being dismantled by competitors."
                    }
                }
            },
            {
                "type": "trend",
                "title": "Aggressive Token Pricing Compression Across Open Weights",
                "desc": "Competitor C has reduced managed fine-tuning rates by 35% following their 70B quantized model release, exerting downstream margin pressure.",
                "comp": comp_c,
                "conf": 0.86,
                "ev_count": 3,
                "prio": "medium",
                "tf": 30,
                "evidence_data": {
                    "detectedPatternFlow": ["70B Model Release", "35% Price Cut", "Inference Credit Pack"],
                }
            },
            {
                "type": "unusual",
                "title": "Unusual Silent API Deprecation and Documentation Scrub",
                "desc": "Competitor B deleted 14 legacy REST endpoints from public documentation without standard 90-day deprecation notices or migration guidance.",
                "comp": comp_b,
                "conf": 0.82,
                "ev_count": 2,
                "prio": "medium",
                "tf": 20,
                "evidence_data": {
                    "detectedPatternFlow": ["Endpoint Scrub", "SDK v4 Focus", "Breaking Change"],
                }
            },
            {
                "type": "historical",
                "title": "Predictable 60-Day Lead Time Between Research Paper and Production API",
                "desc": "Historical tracking across 3 release cycles shows Competitor C consistently productizes whitepaper concepts within 45 to 65 days.",
                "comp": comp_c,
                "conf": 0.88,
                "ev_count": 4,
                "prio": "medium",
                "tf": 90,
                "evidence_data": {
                    "detectedPatternFlow": ["Whitepaper Published", "Compiler Staff Hired", "Production API Release"],
                }
            },
            {
                "type": "pattern",
                "title": "Simultaneous Industry Movement Toward On-Device Model Offerings",
                "desc": "Competitors B and C both shipped quantized 3B–7B parameter models within a 3-week window, targeting local developer workflows.",
                "comp": comp_b,
                "conf": 0.85,
                "ev_count": 3,
                "prio": "medium",
                "tf": 45,
                "evidence_data": {
                    "detectedPatternFlow": ["VS Code Extension", "Quantized Weights", "Offline Completion"],
                }
            },
            {
                "type": "trend",
                "title": "Hyperscaler Co-Selling and Marketplace Distribution Expansion",
                "desc": "Competitor D formalized premier partner status on cloud marketplaces, securing co-sell commitments from hyperscaler field reps.",
                "comp": comp_d,
                "conf": 0.79,
                "ev_count": 2,
                "prio": "low",
                "tf": 60,
                "evidence_data": {
                    "detectedPatternFlow": ["Joint PR", "Marketplace Listing", "Co-sell Incentive"],
                }
            }
        ]

        insights_to_insert = []
        for ins in insights_data:
            i_obj = Insight(
                type=ins["type"],
                title=ins["title"],
                description=ins["desc"],
                competitor_id=ins["comp"].id if ins.get("comp") else None,
                confidence=ins["conf"],
                evidence_count=ins["ev_count"],
                priority=ins["prio"],
                timeframe_days=ins["tf"],
                evidence_data=json.dumps(ins.get("evidence_data", {})),
            )
            insights_to_insert.append(i_obj)

        session.add_all(insights_to_insert)
        session.commit()

        print("Seeding 5 Smart Alerts...")
        alerts_data = [
            {
                "comp": comp_a,
                "title": "Critical Pricing & Packaging Restructure Detected",
                "desc": "Competitor A reduced enterprise base pricing by 18% with mandatory annual commitment clause.",
                "priority": "high",
                "alert_type": "pricing",
                "ev_count": 4,
                "is_read": False,
                "why": "Aggressive enterprise pricing discounting indicates impending launch of their autonomous agent suite.",
                "fact": "Base contract minimum reduced from $24,000/yr to $19,500/yr on public pricing table.",
                "interp": "Competitor A is attempting to lock in enterprise commitments prior to Q4.",
                "signal": "Expect competitive displacement bids against our mid-market accounts.",
            },
            {
                "comp": comp_b,
                "title": "Activity Spike: 5 Coordinated Events in 72 Hours",
                "desc": "Unusual burst of activity across documentation, token packs, and developer town hall.",
                "priority": "high",
                "alert_type": "activity_spike",
                "ev_count": 6,
                "is_read": False,
                "why": "Concentrated release signals imminent major product version announcement within days.",
                "fact": "3 commits to SDK repo and 2 changelog announcements detected in 72h.",
                "interp": "Synchronized marketing and engineering ramp.",
                "signal": "Major SDK v5.0 milestone anticipated.",
            },
            {
                "comp": comp_a,
                "title": "Pattern Confirmation: Precursor to Enterprise Agent Launch",
                "desc": "Sequence of pricing reduction, 4 distributed systems hires, and homepage messaging mirrors 2025 launch.",
                "priority": "high",
                "alert_type": "pattern",
                "ev_count": 5,
                "is_read": False,
                "why": "94% historical pattern fidelity gives high-confidence warning of competitive disruption.",
                "fact": "Historical precedent accurately predicted their last major product release.",
                "interp": "Product launch window estimated at 14–21 days.",
                "signal": "Equip sales team with competitive counter-positioning battlecards.",
            },
            {
                "comp": comp_c,
                "title": "Engineering Org Expansion in Distributed Model Serving",
                "desc": "Competitor C opened 3 compiler and CUDA kernel optimization specialist roles.",
                "priority": "medium",
                "alert_type": "hiring",
                "ev_count": 3,
                "is_read": False,
                "why": "Direct investment into custom hardware acceleration to drive inference costs lower.",
                "fact": "Greenhouse requisitions specifically cite vLLM and TensorRT-LLM expertise.",
                "interp": "Preparing proprietary low-latency serving infrastructure.",
                "signal": "Anticipate lower latency benchmarks published in Q4.",
            },
            {
                "comp": comp_d,
                "title": "Landing Page & Messaging Overhaul Detected",
                "desc": "Competitor D updated privacy policy and homepage highlighting zero-data retention guarantee.",
                "priority": "low",
                "alert_type": "website",
                "ev_count": 2,
                "is_read": True,
                "why": "Strengthening appeal to enterprise security and legal compliance officers.",
                "fact": "Trust center launched with downloadable SOC2 certification letter.",
                "interp": "Addressing enterprise procurement friction.",
                "signal": "Targeting regulated industries (fintech, healthtech).",
            },
        ]

        alerts_to_insert = []
        for a in alerts_data:
            al = Alert(
                competitor_id=a["comp"].id,
                title=a["title"],
                description=a["desc"],
                priority=a["priority"],
                alert_type=a["alert_type"],
                historical_evidence_count=a["ev_count"],
                is_read=a["is_read"],
                why_it_matters=a["why"],
                observation_fact=a["fact"],
                interpretation=a["interp"],
                possible_signal=a["signal"],
            )
            alerts_to_insert.append(al)

        session.add_all(alerts_to_insert)
        session.commit()

        print("Database seeded successfully with 4 competitors, 6 sources, 34 activities, 7 insights, and 5 alerts!")


if __name__ == "__main__":
    seed_database()
