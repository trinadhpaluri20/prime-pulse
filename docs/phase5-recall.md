# Phase 5 — Recall & Historical Intelligence Engine

## 1. Overview & Architecture
Phase 5 introduces the **Recall & Historical Intelligence Engine** on top of the existing competitor, event, and Hindsight persistent memory foundation. 

This engine transforms stored competitive events into actionable historical intelligence, allowing analysts and strategic leaders to ask natural-language questions about competitor trajectories, historical product launches, pricing shifts, and strategic patterns over time.

---

## 2. System Architecture & Data Flow

```
+-----------------------------------------------------------------------+
|                             USER QUERY                                |
|  "What has Microsoft AI done in the last 30 days?"                     |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                        QUERY UNDERSTANDING                            |
|  - Resolve Competitor ("Microsoft AI" -> ID 1)                        |
|  - Parse Date Range ("last 30 days" -> 2026-08-30 to 2026-09-29)       |
|  - Extract Event Category / Keywords                                  |
+-----------------------------------+-----------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+-----------------------+                       +-----------------------+
|  STRUCTURED DB QUERY  |                       | HINDSIGHT MEMORY RECALL|
| (SQLite / PostgreSQL) |                       | (Vector & Semantic)   |
|  Filter: competitor,  |                       |  Query: "Microsoft AI |
|  date range, category |                       |  recent updates"      |
+-----------+-----------+                       +-----------+-----------+
            |                                               |
            +-----------------------+-----------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                     EVENT DEDUPLICATION & MERGE                       |
|  - Map Hindsight memories to DB events via document_id / event_id     |
|  - Eliminate duplicate entries across memory and relational store     |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                        TEMPORAL TIMELINE ORDER                        |
|  - Sort timeline events chronologically (Ascending by event_date)     |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                         PATTERN DETECTION                             |
|  - Detect activity acceleration, category clusters, recurring themes  |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                   EVIDENCE-GROUNDED INTELLIGENCE                      |
|  - Ground Facts, Observations, Insights & Memory Provenance Links     |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                            POST /api/v1/recall                        |
|                             JSON Response                             |
+-----------------------------------------------------------------------+
```

---

## 3. Data Flow & Components

### 3.1 Natural Language Query Parser (`app/utils/query_parser.py`)
- **Date Expressions:** Converts expressions like `today`, `yesterday`, `last 7 days`, `last 30 days`, `last 90 days`, `this month`, `previous month`, `this year` into deterministic UTC `datetime` bounds.
- **Competitor Resolution:** Performs case-insensitive matching against registered competitors in the database.
- **Category Filtering:** Resolves mentioned categories against controlled `EventCategory` enum values (`pricing`, `product`, `feature`, `partnership`, `hiring`, `leadership`, etc.).

### 3.2 Historical Recall Service (`app/services/recall_service.py`)
- **Dual Retrieval Engine:** Fetches structured database records via `EventRepository` and persistent semantic context via `HindsightMemoryService.recall()`.
- **Deduplication:** Normalizes event items and merges Hindsight document references with database records using deterministic document IDs (`event-{competitor_id}-{event_id}`).
- **Timeline Ordering:** Orders events chronologically to expose temporal trajectory.
- **Pattern Detection:** Evaluates activity frequency, category concentration, inactivity periods, and strategic themes.
- **Evidence-Grounded Intelligence:** Formulates response categorized into strictly verifiable `Facts`, derived `Observations`, and reasoned `Insights`, accompanied by `Memory Provenance` tracking.

---

## 4. API Specification

### 4.1 POST `/api/v1/recall`
Main historical intelligence query endpoint accepting natural language questions or structured filters.

#### Request Payload (`RecallQueryRequest`)
```json
{
  "query": "What has Microsoft AI done in the last 30 days?",
  "competitor_id": null,
  "start_date": null,
  "end_date": null,
  "category": null,
  "limit": 20
}
```

#### Response Payload (`RecallQueryResponse`)
```json
{
  "query": "What has Microsoft AI done in the last 30 days?",
  "status": "success",
  "competitor": {
    "id": 1,
    "name": "Microsoft AI",
    "industry": "Enterprise AI"
  },
  "date_range": {
    "start": "2026-08-30T10:15:00Z",
    "end": "2026-09-29T10:15:00Z",
    "expression": "last 30 days"
  },
  "category_filter": null,
  "events": [
    {
      "event_id": 10,
      "date": "2026-09-05T00:00:00Z",
      "category": "product",
      "title": "Launched Copilot Enterprise v2.0",
      "summary": "Major product overhaul adding automated agentic workflows.",
      "importance": "high",
      "memory_document_id": "event-1-10",
      "source_name": "Press Release"
    }
  ],
  "patterns": [
    {
      "pattern_type": "dominant_category",
      "description": "Product-related activity dominated the selected period (1 event).",
      "supporting_event_ids": [10]
    }
  ],
  "facts": [
    "FACT [2026-09-05]: Microsoft AI recorded 'product' event: Launched Copilot Enterprise v2.0."
  ],
  "observations": [
    "OBSERVATION: 1 total event recorded during the period from 2026-08-30 to 2026-09-29."
  ],
  "insights": [
    "INSIGHT: Competitor activity during this period focuses on product innovation and feature updates."
  ],
  "memory_sources": [
    {
      "memory_document_id": "event-1-10",
      "event_id": 10,
      "source_type": "hindsight",
      "relevance": "exact_match",
      "timestamp": "2026-09-05T00:00:00Z"
    }
  ],
  "memory_status": "connected",
  "summary": "In the last 30 days, Microsoft AI recorded 1 event focused primarily on product."
}
```

### 4.2 GET `/api/v1/competitors/{competitor_id}/history`
Deterministic historical timeline recall endpoint for a specific competitor.

#### Query Parameters:
- `start_date` (optional ISO datetime)
- `end_date` (optional ISO datetime)
- `category` (optional `EventCategory`)
- `limit` (default 50, max 100)

---

## 5. Resilient Error & Failure Handling

| Failure Scenario | System Behavior | User Response |
|---|---|---|
| **Unknown Competitor** | Prompt user to clarify competitor | Returns `404 Not Found` or `status: "missing_competitor"` with list of available competitors. |
| **No Historical Events Found** | Return valid empty timeline | Returns `status: "success"` with empty `events` list and clear explanatory summary. |
| **Invalid Date Range** (Start > End) | Validation failure | Returns `422 Unprocessable Entity` error detailing date constraint. |
| **Hindsight Unavailable / Unconfigured** | Degradation fallback | API falls back to relational DB events, sets `memory_status: "unavailable"`, and proceeds seamlessly. |

---

## 6. Testing Strategy
Phase 5 introduces comprehensive unit and integration tests under `tests/backend/test_recall_service.py`:
1. Natural language date parsing validation.
2. Competitor name extraction and entity resolution.
3. Event filtering by category and date range.
4. Chronological timeline ordering.
5. Deterministic deduplication of DB events and Hindsight memories.
6. Hindsight recall integration & fallback behavior when Hindsight is offline.
7. Pattern detection algorithms.
8. API endpoint schema validation for `POST /api/v1/recall` and `GET /api/v1/competitors/{id}/history`.
