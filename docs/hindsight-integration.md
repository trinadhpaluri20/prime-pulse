# Hindsight Persistent Memory Integration & Specification

## 1. Overview & Purpose
**Hindsight** is the designated persistent memory layer for the **Competitive Intelligence Agent**. 

Conventional LLM applications and basic RAG architectures query point-in-time documents. However, competitive intelligence evolves over months and years across multiple market events (pricing adjustments, product launches, executive hiring, strategic shifts). Hindsight provides persistent, long-term memory that preserves historical knowledge across timeline horizons and recalls relevant context dynamically.

---

## 2. Planned Architecture

```
                    ┌─────────────────────┐
                    │   FastAPI Backend   │
                    └──────────┬──────────┘
                               │
                ┌──────────────▼──────────────┐
                │ HindsightMemoryService      │
                │                             │
                │ retain()                    │
                │ recall()                    │
                │ health_check()              │
                │ ensure_bank()               │
                └──────────────┬──────────────┘
                               │
                               ▼
                    Hindsight Python Client
                               │
                               ▼
                 Hindsight Cloud / API Engine
                               │
                  Hindsight Memory Bank Store
                  ("competitive-intelligence")
                               │
                 ┌─────────────┼─────────────┐
                 ▼             ▼             ▼
               World       Experience    Observation
```

---

## 3. Relational Database vs. Hindsight Memory

A fundamental architectural principle of this system is the clear separation of concerns between our relational database and Hindsight:

| System | Primary Responsibility | Data Examples |
|---|---|---|
| **Relational Database** *(SQLite / Postgres)* | Structured application state, relational integrity, pagination, audit records, and fast indexing. | Competitor IDs, entity names, exact timestamps, event IDs, category strings, raw URLs, database primary keys. |
| **Hindsight Memory Bank** | Persistent semantic memory, temporal context retention, cross-event knowledge extraction, historical pattern recall. | Fact narratives, competitive positioning shifts, strategic moves, historical precedents, experience & observation facts. |

---

## 4. Hindsight Memory Categories

Hindsight categorizes stored memories into three distinct types:
- **`world`:** Facts about competitors, products, pricing models, market segments, and industry landscape.
- **`experience`:** Recorded events, actions, investigations, and analyst observations.
- **`observation`:** Higher-level consolidated knowledge and strategic insights derived over time.

---

## 5. Setup & Configuration Guide

### Step 1: Environment Configuration
Add Hindsight settings to your `.env` file (copied from `.env.example`):

```ini
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_API_KEY=your_actual_hindsight_api_key_here
HINDSIGHT_BANK_ID=competitive-intelligence
HINDSIGHT_TIMEOUT_SECONDS=10.0
```

> **Security Requirement:** Never hardcode `HINDSIGHT_API_KEY` into source files, git commits, documentation, or public API responses.

### Step 2: Initialize Memory Bank
Run the setup script to verify connection and ensure the target memory bank exists:

```bash
python scripts/setup_hindsight.py
```

### Step 3: Verify API Health
Start FastAPI backend and inspect health status:

```bash
uvicorn app.main:app --reload
```
Navigate to `GET http://localhost:8000/api/v1/health` or `GET http://localhost:8000/api/health`:

```json
{
  "status": "healthy",
  "service": "competitive-intelligence-agent",
  "database": "connected",
  "hindsight": "connected"
}
```

---

## 6. Memory Operations (`HindsightMemoryService`)

### Retain (`retain`)
Persists structured market facts or competitor events into Hindsight memory.
- **`content`:** Text narrative describing the competitor fact or event.
- **`context`:** High-level context tag (e.g. `competitor_event`, `pricing_shift`).
- **`timestamp`:** Historical date when the event actually occurred.
- **`metadata`:** Key-value pairs containing `competitor_id`, `category`, etc.
- **`document_id`:** Deterministic ID ensuring idempotency and preventing duplicate memories upon updates.

### Recall (`recall`)
Retrieves relevant memories based on semantic and temporal queries.
- **`query`:** Search term or analyst question (e.g., `"Has Competitor X changed pricing recently?"`).
- **`types`:** Optional list filtering memory categories (`world`, `experience`, `observation`).
- **`limit`:** Maximum number of memory facts returned.

---

## 7. Development-Only Testing Endpoints

For development and verification, two dev-only endpoints are available:

- `POST /api/v1/memory/test`: Submits a sample test memory to Hindsight.
- `GET /api/v1/memory/test/recall?q=pricing`: Queries Hindsight for test memories.

---

## 8. Competitor Event Retain Workflow (Phase 4 Completed)

When a competitor event is created (`POST /api/v1/competitors/{competitor_id}/events`) or updated (`PUT /api/v1/events/{event_id}`), the system executes dual persistence:

1. **Structured DB Persistence:** Saves event record into SQLite/Postgres via `EventRepository`.
2. **Deterministic Document ID:** Computes `document_id = f"event-{competitor_id}-{event_id}"`.
3. **Rich Payload Formatting:** Converts the event into a structured human-readable narrative.
4. **Hindsight Retention:** Pushes memory via `HindsightMemoryService.retain()`.
5. **Resilient Failure Handling:** If Hindsight is not configured or fails, the database transaction is preserved, and the API response explicitly reports `memory.status` (`retained`, `not_configured`, or `failed`).
6. **Manual Re-Sync:** Events can be manually pushed to Hindsight on demand via `POST /api/v1/events/{event_id}/sync-memory`.

---

## 9. What Will Happen in Phase 5
In **Phase 5**, we will build the **Recall and Historical Intelligence Engine**, allowing the system to query Hindsight persistent memory by competitor, date range, topic, and category to retrieve contextual memory facts for comparative trend analysis.
