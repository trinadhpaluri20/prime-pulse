# Architecture & System Design (Planned)

## Planned Architecture Diagram

```
User / Strategic Analyst
         ↓
 ┌───────────────┐
 │ React         │
 │ Frontend      │  (Interactive UI, Dashboard, Timeline, Memory Explorer)
 └───────┬───────┘
         ↓ REST / JSON
 ┌───────────────┐
 │ FastAPI       │
 │ Backend API   │  (API Controllers, Middleware, Validation Schemas)
 └───────┬───────┘
         ↓
 ┌───────────────┐
 │ AI Agent      │
 │ Orchestrator  │  (Agent State, Reasoning Loop, Prompt Engineering)
 └───────┬───────┘
         │
 ┌───────┴─────────────────────────┬─────────────────────────┐
 ↓                                 ↓                         ↓
 ┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
 │ Hindsight       │     │ Database         │     │ LLM Engine       │
 │ Memory          │     │ Structured Data  │     │ Reasoning        │
 │ (Persistent     │     │ (Competitors,    │     │ (Gemini / OpenAI │
 │  Memory Banks)  │     │  Event Metadata) │     │  / Anthropic)    │
 └────────┬────────┘     └────────┬─────────┘     └────────┬─────────┘
          └────────────────────────┼────────────────────────┘
                                   ↓
                   [ Evidence-backed Intelligence ]
                                   ↓
                       User Dashboard & Alerts
```

---

## Component Responsibilities

### 1. React Frontend Layer
- **Responsibility:** User interaction and intelligence visualizer.
- **Key Modules:**
  - Executive Dashboard (High-level competitor status & recent signals)
  - Competitor Event Feed (Inputting and viewing market events)
  - Timeline View (Chronological visualization of competitor trajectories)
  - Memory Explorer (Deep inspection of persistent memories retained in Hindsight)
  - Strategic Analysis Console (Interactive AI synthesis queries with evidence citations)

### 2. FastAPI Backend API Layer
- **Responsibility:** High-performance RESTful API endpoints and application routing.
- **Key Modules:**
  - `api/`: Route handlers for competitors, events, memory, agent actions, and analytics.
  - `schemas/`: Pydantic input validation models and response schemas.
  - `core/`: Application settings, environment loading, and security configurations.
  - `services/`: Business logic orchestration connecting databases, agents, and external services.

### 3. AI Agent Layer (`agents/`)
- **Responsibility:** Autonomous or semi-autonomous reasoning loop for competitive intelligence.
- **Key Operations:**
  - Event Categorization & Entity Extraction
  - Retain Workflow Triggering
  - Multi-step Memory Recall Orchestration
  - Signal & Pattern Detection Synthesis

### 4. Hindsight Memory Layer
- **Responsibility:** Core persistent memory infrastructure.
- **Key Operations:**
  - Stores long-term competitor history in isolated banks.
  - Executes semantic, entity, and temporal recall queries.
  - Returns relevant historical context with memory confidence metrics.

### 5. Structured Database Layer (`db/`, `models/`, `repositories/`)
- **Responsibility:** Relational or document storage for structured metadata.
- **Key Entities:**
  - Competitor profiles (name, industry, domain, logo, status)
  - Event records & metadata tags
  - User preferences and audit logs

### 6. Gemini LLM Engine Layer (`app/services/gemini_service.py`)
- **Responsibility:** Google GenAI Gemini completion client (`google-genai` SDK).
- **Key Functions:**
  - Performs evidence-grounded natural language reasoning over recalled Hindsight persistent memories and structured database events.
  - Enforces strict prohibition against data hallucination.
  - Categorizes analytical output into **FACT**, **OBSERVATION**, **INSIGHT**, and **LIMITATIONS**.

---

## Data Flow for a Competitive Intelligence Query

1. **User Action:** Analyst inputs a query ("What has Microsoft AI done in the last 90 days?").
2. **Backend Processing:** FastAPI receives request at `POST /api/v1/analyze` and delegates to `AgentService`.
3. **Tool Execution:** Agent executes `retrieve_historical_context` tool (Phase 5 Recall Engine), invoking `HindsightMemoryService.recall()` and `EventRepository.search_events()`.
4. **Evidence Context Formatting:** Agent normalizes and deduplicates events into a structured context payload.
5. **Gemini Synthesis:** Agent prompts `GeminiService` with system prompt + evidence context + user query.
6. **Response Formulation:** Agent returns structured `AgentAnalysisResponse` containing summary, facts, observations, insights, evidence timeline, memory provenance, and service statuses.

---

## Phased Implementation Note
> **Status:** Phase 6 completed: Backend foundation, database layer, Hindsight persistent memory service, Competitor Event Retain Workflow (`POST /api/v1/competitors/{id}/events`), Recall Engine (`POST /api/v1/recall`), and AI Agent Orchestration (`POST /api/v1/analyze` with Gemini LLM reasoning, evidence context grounding, resilient fallbacks, and memory provenance) are fully implemented and verified with 54 automated tests.

