# Hindsight Memory Architecture & Strategy (Planned)

## Overview
Hindsight persistent memory is the foundational core of the **Competitive Intelligence Agent**. 

In conventional LLM applications, conversations are ephemeral or rely on simple RAG (Retrieval-Augmented Generation) across static documents. For competitive intelligence, point-in-time document retrieval is insufficient: competitive strategy evolves across timeline horizons, requiring a memory system that retains events over time and recalls context dynamically based on temporal, relational, and semantic relevance.

---

## Planned Core Workflow

```
       [ Competitor Event / Market Signal ]
                        ↓
                  +-----------+
                  |  RETAIN   |
                  +-----------+
                        ↓
         [ Persistent Competitor Memory ]
          (Hindsight Memory Bank Stores)
                        ↓
                  +-----------+
                  |  RECALL   |
                  +-----------+
                        ↓
            [ Historical Context ]
                        ↓
                  +-----------+
                  |  REASON   |
                  +-----------+
                        ↓
    [ Evidence-backed Strategic Intelligence ]
```

---

## Planned Memory Operations

### 1. RETAIN (Memory Storage)
- **Objective:** Persist structured competitor updates, market signals, executive moves, pricing changes, and feature releases into designated memory banks.
- **Bank Structure:** Memory will be partitioned logically (e.g., per competitor ID, market sector, or product line) to enable scoped recall and isolated memory evaluation.
- **Attributes Retained:**
  - Competitor entity identifier
  - Event timestamp / historical date
  - Event type (Product Launch, Pricing Shift, Key Hire, Strategic Pivot, Acquisition)
  - Detailed narrative / evidence transcript
  - Source confidence & metadata links

### 2. RECALL (Memory Retrieval)
- **Objective:** Fetch relevant past memories when evaluating new events, generating strategic reports, or analyzing competitor trends.
- **Recall Capabilities:**
  - **Temporal Recall:** Retrieve events occurring within specific timeframes or chronological sequences.
  - **Entity-Specific Recall:** Focus on individual competitors or direct comparison groups.
  - **Semantic Pattern Recall:** Find historical precedents matching current competitor movements.

### 3. REASON & SYNTHESIZE (AI Intelligence Generation via Gemini)
- **Objective:** Combine recalled historical Hindsight persistent memories with relational database facts using **Google Gemini LLM** reasoning (`GeminiService` / `google-genai` SDK).
- **Outputs:**
  - Delta analysis & executive summaries ("How does this product release differ from their strategy 6 months ago?")
  - Trajectory interpretation ("Based on recalled partnership and pricing memories, Competitor X is pivoting towards enterprise agent orchestration.")
  - Grounded evidence lists linking every statement back to recalled memory document IDs (`event-{competitor_id}-{event_id}`).

---

## Implementation Status Note
> **Status:** Phase 6 completed: Automatic Competitor Event Retain Workflow (`POST /api/v1/competitors/{id}/events` dual persistence), the Recall & Historical Intelligence Engine (`POST /api/v1/recall` & `GET /api/v1/competitors/{id}/history`), AND the AI Agent Orchestrator (`POST /api/v1/analyze` combining Hindsight persistent memory with Google Gemini LLM reasoning and evidence grounding) are fully implemented and verified with 54 automated tests.

