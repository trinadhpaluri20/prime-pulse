# Phase 6 — AI Agent Orchestration with Google Gemini

## 1. Overview & Objectives
Phase 6 implements the **AI Agent Orchestration Layer**, connecting user natural-language queries, structured database events, Phase 5 historical recall, Hindsight persistent memory, and the **Google Gemini LLM reasoning engine** (`google-genai` SDK).

While conventional AI search tools pass raw user prompts directly to an LLM (causing hallucinations and temporal confusion), this platform enforces a **Memory-First, Evidence-Grounded Agent Pipeline**:
- **Hindsight** remains the persistent memory layer retaining historical competitor events across timeline horizons.
- **Gemini** serves as the reasoning engine, performing synthesis, pattern interpretation, and executive summarization over strictly grounded historical evidence.

---

## 2. Target System Architecture & Data Flow

```
+-----------------------------------------------------------------------+
|                                USER                                   |
|       "What has Microsoft AI done in the last 90 days and what        |
|                    patterns can be observed?"                         |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                        FASTAPI BACKEND API                            |
|                        POST /api/v1/analyze                           |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                      AI AGENT ORCHESTRATOR                            |
|                    (app/services/agent_service.py)                     |
+-----------------------------------+-----------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+-----------------------+                       +-----------------------+
| QUERY INTERPRETATION  |                       |      AGENT TOOLS      |
|  - Competitor Match   |                       | 1. Recall Engine      |
|  - Date Range UTC     |                       | 2. Hindsight Memory   |
|  - Event Category     |                       | 3. Relational DB      |
+-----------+-----------+                       +-----------+-----------+
            |                                               |
            +-----------------------+-----------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                     EVIDENCE NORMALIZATION & MERGE                    |
|  - Deduplicate DB events & Hindsight memories via document IDs        |
|  - Order timeline events chronologically                              |
|  - Structure rich evidence context (Facts, Metadata, Memory Tags)     |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                         GEMINI LLM ENGINE                             |
|                   (app/services/gemini_service.py)                    |
|  - SDK: google-genai (Google AI Studio)                               |
|  - System Prompt: Strict evidence grounding (No invented facts)       |
|  - User Payload: Structured Evidence Context + Query                  |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                   STRUCTURED ANALYSIS RESPONSE                        |
|  - Categorized into: FACT, OBSERVATION, INSIGHT                       |
|  - Memory Provenance & Citation Tracking                              |
|  - Explicit Status & Limitation Declarations                          |
+-----------------------------------------------------------------------+
```

---

## 3. Core Component Responsibilities

### 3.1 Gemini Service Adapter (`app/services/gemini_service.py`)
- **Responsibility:** Isolated client adapter using the official `google-genai` SDK (`from google import genai`).
- **Configuration:** `GEMINI_API_KEY`, `GEMINI_MODEL` (default: `gemini-2.5-flash`), `GEMINI_TIMEOUT_SECONDS`.
- **Security:** API keys are loaded via `backend/.env` and never logged or exposed in responses.
- **Resilience:** Handles quota limits, API exceptions, and unconfigured states gracefully without crashing the server.

### 3.2 Agent Tools (`app/services/agent_service.py`)
- **Tool 1: `retrieve_historical_context`** — Executes Phase 5 dual retrieval across relational DB and Hindsight persistent memory.
- **Tool 2: `get_competitor_history`** — Fetches deterministic competitor history timeline with memory provenance.
- **Tool 3: `get_competitor_events`** — Queries relational event records directly via `EventRepository`.

### 3.3 Evidence Context Generator
Before sending prompts to Gemini, the agent constructs a clean, structured evidence context containing:
- Target competitor profile (Name, Industry, Website)
- Resolved date range bounds
- Chronologically ordered database events (ID, Category, Date, Title, Description, Importance, Source URL)
- Recalled Hindsight memory snippets and document IDs (`event-{competitor_id}-{event_id}`)

### 3.4 Gemini System Prompt & Grounding Principles
Gemini is instructed under strict rules:
1. **Competitive Intelligence Persona:** Act as a senior strategic intelligence analyst.
2. **Strict Evidence Grounding:** Base all conclusions strictly on the provided evidence context. Do NOT invent events, dates, products, pricing, or partnerships.
3. **Mandatory Classification:**
   - **FACT:** Directly supported by a recorded event or memory snippet.
   - **OBSERVATION:** Derived pattern from multiple recorded facts.
   - **INSIGHT:** Reasoned strategic interpretation grounded in facts and observations.
4. **Insufficient Data Handling:** If available evidence is insufficient to answer the query reliably, explicitly declare the limitation.

---

## 4. API Specification

### 4.1 POST `/api/v1/analyze`
Primary agent analysis endpoint executing the complete memory-recalled LLM reasoning pipeline.

#### Request Payload (`AgentAnalysisRequest`)
```json
{
  "query": "What has Microsoft AI done in the last 90 days and what patterns can be observed?",
  "competitor_id": null,
  "start_date": null,
  "end_date": null,
  "category": null
}
```

#### Response Payload (`AgentAnalysisResponse`)
```json
{
  "query": "What has Microsoft AI done in the last 90 days and what patterns can be observed?",
  "status": "success",
  "competitor": {
    "id": 1,
    "name": "Microsoft AI",
    "industry": "Enterprise Software"
  },
  "date_range": {
    "start": "2026-06-30T11:00:00Z",
    "end": "2026-09-29T11:00:00Z",
    "expression": "last 90 days"
  },
  "summary": "In the last 90 days, Microsoft AI recorded 4 major events across product, pricing, and partnership categories...",
  "facts": [
    "FACT [2026-09-14]: Microsoft AI released Copilot Enterprise v2.0."
  ],
  "observations": [
    "OBSERVATION: Product-related announcements accelerated in the second half of the period."
  ],
  "insights": [
    "INSIGHT: Microsoft AI is pivoting aggressively towards autonomous agentic capabilities."
  ],
  "evidence": [
    {
      "event_id": 3,
      "competitor_id": 1,
      "competitor_name": "Microsoft AI",
      "date": "2026-09-14T00:00:00Z",
      "category": "product",
      "title": "Copilot Enterprise v2.0 Release",
      "summary": "Major upgrade adding autonomous workflow orchestration.",
      "importance": "critical",
      "memory_document_id": "event-1-3",
      "source_name": "Press Release"
    }
  ],
  "memory_sources": [
    {
      "memory_document_id": "event-1-3",
      "event_id": 3,
      "source_type": "hindsight",
      "relevance": "exact_match",
      "timestamp": "2026-09-14T00:00:00Z"
    }
  ],
  "memory_status": "connected",
  "gemini_status": "connected",
  "limitations": []
}
```

---

## 5. Resilient Error & Failure Handling

| Scenario | System Behavior | Endpoint Response |
|---|---|---|
| **Missing `GEMINI_API_KEY`** | Server runs normally. Agent falls back to Phase 5 evidence engine. | `status: "degraded"`, `gemini_status: "not_configured"`, evidence & facts returned seamlessly. |
| **Gemini API Timeout / Error** | Catches SDK exception, logs error without secrets, returns retrieved evidence. | `status: "degraded"`, `gemini_status: "unavailable"`, facts & recall evidence returned. |
| **Hindsight Offline / Unconfigured** | Falls back to relational DB records, passes DB context to Gemini. | `memory_status: "unavailable"`, `gemini_status: "connected"`, Gemini reasons over DB evidence. |
| **Unknown Competitor** | Prompt analyst to clarify competitor. | `status: "missing_competitor"`, list of registered competitors returned. |

---

## 6. Testing Strategy
Phase 6 introduces comprehensive tests in `tests/backend/test_agent_service.py`:
1. Successful Gemini API completion with mocked response.
2. Unconfigured `GEMINI_API_KEY` degraded mode.
3. Gemini API error/quota degraded mode.
4. Agent dual retrieval combining DB events and Hindsight memories.
5. Hindsight offline fallback mode.
6. DB event retrieval tools.
7. Evidence context deduplication.
8. End-to-end agent orchestration pipeline.
9. Empty query 422 validation.
10. Unknown competitor query handling.
11. Competitor with zero historical records.
12. Gemini response schema parsing & validation.
13. Provenance and memory citation tracking.
14. Regression testing: Verify all 54 Phase 1–6 tests pass cleanly.
