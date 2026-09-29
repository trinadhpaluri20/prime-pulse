# Competitive Intelligence Agent

A memory-driven AI Competitive Intelligence platform for HackwithHyderabad 3.0.

---

## 1. Project Overview
**Competitive Intelligence Agent** is a persistent-memory AI system designed for tracking, analyzing, and detecting strategic shifts across business competitors over time. 

Unlike conventional search tools or basic AI chatbots, this platform uses **Hindsight persistent memory** to remember historical competitor actions, product launches, pricing shifts, key hires, and strategic pivots—connecting events across time to deliver actionable, evidence-backed competitive insights.

---

## 2. Problem
Modern competitive intelligence suffers from several critical bottlenecks:
- **Information Ephemerality:** AI tools treat every user interaction in isolation, lacking awareness of historical competitor activities.
- **Fragmented Signals:** News, press releases, job postings, and pricing updates occur continuously over months and years, making human pattern recognition difficult.
- **Surface-Level Analysis:** Generic LLM chatbots answer point-in-time questions ("What is Competitor X's pricing?") but fail to answer temporal strategic queries ("How has Competitor X changed their market positioning over the last 6 months?").
- **Lack of Evidence:** AI-generated market research often lacks traceable historical citations and confidence grounding.

---

## 3. Proposed Solution
A specialized Competitive Intelligence Agent that combines structured tracking with **Hindsight persistent memory**. 

The system will allow strategic teams and decision-makers to:
- **Track competitors:** Maintain dedicated intelligence banks for targeted industry players.
- **Record competitor events:** Ingest structured and unstructured market signals (product announcements, strategy changes, pricing updates, executive shifts).
- **Retain historical information:** Store long-term competitor history inside persistent memory banks.
- **Recall relevant historical context:** Retrieve historical timelines and facts dynamically during analytical tasks.
- **Identify changes over time:** Contrast past statements, positioning, and releases with current market actions.
- **Detect competitive signals:** Spot subtle trends and proactive strategic shifts before they become obvious market threats.
- **Identify historical patterns:** Uncover multi-month patterns and recurring competitive behaviors.
- **Generate evidence-backed AI insights:** Produce clear executive summaries backed by verifiable historical memory trails.

---

## 4. Historical Intelligence / Recall (Phase 5 Implemented)

The **Recall & Historical Intelligence Engine** allows strategic analysts to ask natural-language questions about a competitor's history and receive structured, evidence-grounded intelligence.

### End-to-End Recall Workflow:
1. **User Submits Question:** Analyst inputs a query (e.g. *"What has Microsoft AI done in the last 30 days?"*).
2. **Query Interpretation:** The engine parses natural language date expressions (`last 30 days`), target competitor name, and event categories (`product`, `pricing`, `partnership`).
3. **Competitor / Date / Category Resolution:** Resolves target competitor entity and computes exact UTC date bounds.
4. **Historical Event Retrieval:** Structured relational database records are queried via `EventRepository`.
5. **Hindsight Persistent Memory Search:** Contextually relevant historical memories are recalled from Hindsight via `HindsightMemoryService.recall()`.
6. **Merging & Deduplication:** Database events and Hindsight memories are merged using deterministic document IDs (`event-{competitor_id}-{event_id}`), eliminating duplicates.
7. **Timeline Creation:** Normalized events are ordered chronologically (ascending by `event_date`) to reveal competitor trajectory over time.
8. **Pattern Detection:** Automated algorithms detect activity acceleration, category concentration, inactivity gaps, and recurring strategic themes.
9. **Evidence-Grounded Synthesis:** The engine categorizes output strictly into verifiable **Facts**, derived **Observations**, reasoned **Insights**, and **Memory Provenance** citations.
10. **Structured Response:** Returns complete intelligence payload via `POST /api/v1/recall` and deterministic timeline via `GET /api/v1/competitors/{id}/history`.

---

## 5. Core Innovation & Product Architecture
> **"Competitive intelligence that remembers."**

The critical distinction of this project is that **it is NOT a generic chatbot**. It is a persistent-memory competitive intelligence engine.

### Intelligence Pipeline
```
COMPETITOR EVENTS
        ↓
PERSISTENT MEMORY (Hindsight)
        ↓
HISTORICAL RECALL
        ↓
COMPETITIVE SIGNALS
        ↓
PATTERN DETECTION
        ↓
EVIDENCE-GROUNDED INTELLIGENCE
```

---

## 6. Hindsight Memory Integration
Hindsight persistent memory serves as the foundational brain of the platform.

- **RETAIN:** Dual persistence of competitor events into isolated memory banks with deterministic document IDs.
- **RECALL:** Dual retrieval combining vector/semantic Hindsight recall with indexed database searches.
- **REASON:** Synthesis of recalled historical memories with current events into grounded facts, observations, and insights.

*(Note: Detailed memory architecture is documented in [`docs/hindsight-memory.md`](docs/hindsight-memory.md) and [`docs/phase5-recall.md`](docs/phase5-recall.md)).*

---

## 7. Judging Criteria Alignment
| Criteria | Weight | How Project Addresses It |
|---|---|---|
| **Innovation** | 30% | Genuine competitive intelligence workflow utilizing persistent temporal memory to connect market signals across time. |
| **Use of Hindsight Memory** | 25% | Memory is central: events are retained with deterministic IDs, dual retrieval merges Hindsight context, and memory provenance is tracked for every insight. |
| **Technical Implementation** | 20% | Clean modular architecture (FastAPI, SQLAlchemy 2.x, Pydantic v2), typed schemas, resilient fallback handling when Hindsight is offline, and 40 automated tests. |
| **User Experience** | 15% | Natural-language query interface returning structured timelines, category filters, detected patterns, and verifiable evidence lists. |
| **Real-world Impact** | 10% | Solves enterprise competitive intelligence challenges in product roadmap planning, positioning, pricing analysis, and M&A intelligence. |

---

## 8. Development Status & Roadmap
- **Phase 1 (Completed):** Project foundation, initial structure, and documentation specs.
- **Phase 2 (Completed):** Backend foundation & database layer (FastAPI, SQLAlchemy 2.x, Alembic, Competitor & Event CRUD).
- **Phase 3 (Completed):** Hindsight persistent memory integration (`HindsightMemoryService`, bank setup, health checks, dev test endpoints).
- **Phase 4 (Completed):** Competitor Event Retain Workflow (Dual persistence, deterministic `document_id`, rich memory payloads, resilient error handling).
- **Phase 5 (Completed):** Recall & Historical Intelligence Engine (`POST /api/v1/recall`, date parsing, deduplication, pattern detection, evidence grounding, memory provenance).
- **Phase 6 (Completed):** AI Agent Orchestration with Google Gemini (`POST /api/v1/analyze`, `GeminiService`, `AgentService`, tool execution, evidence grounding, resilient degraded fallbacks, 54 unit tests).
- **Phase 7 (Completed):** Production Hardening, Integration Verification & Demo Readiness (verified 12 API endpoints, health monitoring, security secret shielding, comprehensive 54-test suite pass).
- **Phase 8 (Completed):** Frontend Dashboard & User Experience (Interactive React 18/19 app with Executive Dashboard, Gemini AI Strategy Console, Historical Recall Engine, Competitor Management, and Memory Explorer).
- **Phase 9 (Planned):** Timeline & competitive signal visualizer.
- **Phase 10 (Planned):** Memory Explorer interface.
- **Phase 11 (Planned):** Demo dataset & interactive demo mode.
- **Phase 12 (Planned):** Final UX polish & documentation.


---

## 9. AI Agent Orchestration with Gemini (Phase 6)

Phase 6 introduces the **AI Agent Orchestrator** leveraging Google Gemini (`google-genai` SDK) as the reasoning layer while keeping **Hindsight** as the central persistent memory system.

### Pipeline Flow:
```
USER QUERY
   ↓
POST /api/v1/analyze
   ↓
QUERY INTERPRETATION & ENTITY RESOLUTION
   ↓
RECALL ENGINE (Phase 5)
   ↓
HINDSIGHT PERSISTENT MEMORY & DATABASE RETRIEVAL
   ↓
EVIDENCE CONTEXT FORMULATION (Facts, Timeline, Provenance)
   ↓
GEMINI LLM REASONING (Strict Evidence Grounding)
   ↓
FINAL COMPETITIVE INTELLIGENCE RESPONSE (Facts, Observations, Insights)
```

Gemini operates under strict system prompt constraints: it reasons exclusively over retrieved evidence context and is prohibited from fabricating competitor events, dates, products, or pricing. Response payloads differentiate between **FACT**, **OBSERVATION**, and **INSIGHT**, with traceable memory provenance for every claim.

---

## 10. Technology Stack
- **Backend:** Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.x
- **Memory Layer:** Hindsight SDK / API (`hindsight-client`)
- **LLM Provider:** Google Gemini API (`google-genai` SDK)
- **Database:** SQLite / PostgreSQL (Relational metadata, competitors, events, sources)
- **Testing:** Pytest (54 passed unit & integration tests)
- **Infrastructure:** Docker, Docker Compose

