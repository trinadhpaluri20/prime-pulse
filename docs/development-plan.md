# Development Roadmap & Plan

## Overview
This document outlines the strict, multi-phase execution sequence for building the **Competitive Intelligence Agent**. Development will progress in controlled phases to ensure high technical quality, modular design, and robust integration of Hindsight persistent memory.

---

## Phase Sequence

### PHASE 1 — Project Foundation (Completed)
- Establish repository structure, directory tree, `.gitignore`, `.env.example`, `docker-compose.yml`, and `README.md`.
- Document core product vision, innovation pipeline, judging criteria alignment, code quality standards, and architectural blueprints.
- **Deliverable:** Clean, verified project foundation.

### PHASE 2 — Backend Foundation + Database (Completed)
- Set up FastAPI backend boilerplate with environment configuration (`pydantic-settings`).
- Implement database connection handling (`SQLAlchemy 2.x`) and ORM models (`Competitor`, `CompetitorEvent`, `EventSource`).
- Build repositories and Pydantic schemas for structured competitor and event CRUD.
- Generate and apply initial Alembic migrations (`competitors`, `competitor_events`, `event_sources`).
- Implement REST API endpoints (`/api/v1/health`, `/api/v1/competitors`, `/api/v1/events`).
- Write backend test suite using `pytest` and `httpx` (`13 passed`).
- **Deliverable:** Functional backend foundation and database layer.

### PHASE 3 — Hindsight Integration (Completed)
- Integrate official Hindsight SDK (`hindsight-client 0.10.1`) into `app/services/hindsight_service.py`.
- Establish typed configuration for Hindsight (`HINDSIGHT_BASE_URL`, `HINDSIGHT_API_KEY`, `HINDSIGHT_BANK_ID`).
- Build `scripts/setup_hindsight.py` script to create/verify the `competitive-intelligence` memory bank.
- Extend `/api/v1/health` and `/api/health` to report Hindsight connectivity status.
- Expose development-only test endpoints (`POST /api/v1/memory/test` and `GET /api/v1/memory/test/recall`).
- Create unit test suite mocking Hindsight client without requiring live cloud APIs.
- **Deliverable:** Persistent memory service adapter ready for event retention in Phase 4.

### PHASE 4 — Competitor Event Retain Workflow (Completed)
- Wire `POST /api/v1/competitors/{competitor_id}/events` to `HindsightMemoryService.retain()`.
- Establish deterministic `document_id` strategy (`event-{competitor_id}-{event_id}`).
- Construct human-readable structured memory payloads containing competitor context, category, title, date, importance, and source.
- Implement dual persistence (relational DB + Hindsight persistent memory).
- Ensure resilient failure handling (DB transaction preserved if Hindsight is unconfigured/fails, returning explicit `memory.status`).
- Expose manual re-sync endpoint (`POST /api/v1/events/{event_id}/sync-memory`).
- Write comprehensive test suite (`26 passed`).
- **Deliverable:** Fully functional Competitor Event Retain Workflow.

### PHASE 5 — Recall and Historical Intelligence (Completed)
- Build `app/utils/query_parser.py` for parsing natural language date expressions (`last 30 days`, `this month`), competitor names, and categories.
- Create Pydantic models for recall request/response in `app/schemas/recall.py`.
- Build `RecallService` in `app/services/recall_service.py` performing dual retrieval across structured database records and Hindsight persistent memory.
- Implement event deduplication, chronological timeline ordering, pattern detection algorithms, and evidence-grounded formatting (Facts, Observations, Insights, Memory Provenance).
- Expose REST API endpoints `POST /api/v1/recall` and `GET /api/v1/competitors/{id}/history`.
- Write comprehensive test suite in `tests/backend/test_recall_service.py` covering all 14 Phase 5 requirements (`40 passed`).
- **Deliverable:** Fully functional Recall & Historical Intelligence Engine.

### PHASE 6 — AI Agent Orchestration
- Implement core agent reasoning loop in `app/agents/`.
- Integrate LLM provider (Gemini / OpenAI / Anthropic) with structured prompt templates.
- Wire agent tools to pull from both Hindsight persistent memory and relational database.
- Ensure output formatting includes verifiable evidence citations.
- **Deliverable:** Working AI Competitive Intelligence Agent providing memory-backed strategic analysis.

### PHASE 7 — Frontend Dashboard
- Initialize React frontend application (Vite + TypeScript).
- Design premium visual theme, modern dark mode, and design system tokens.
- Build Executive Dashboard displaying competitor tracking cards and recent activity.
- **Deliverable:** Responsive, high-impact frontend connected to backend API endpoints.

### PHASE 8 — Timeline + Competitive Signals
- Build interactive visual timeline component mapping competitor events across time.
- Implement automatic signal detection logic highlighting key strategic moves (Pivots, Aggressive Hiring, Pricing Adjustments).
- **Deliverable:** Interactive competitor timeline and automatic signal detection UI.

### PHASE 9 — Memory Explorer
- Build dedicated Memory Explorer interface in the React frontend.
- Allow users to inspect raw and structured memories stored inside Hindsight banks.
- Display memory timestamps, relevance scores, and source evidence.
- **Deliverable:** Transparent Memory Explorer proving Hindsight integration to users and judges.

### PHASE 10 — Demo Dataset + Demo Mode
- Prepare curated, realistic competitor dataset (e.g., 6–12 months of competing AI startup signals).
- Build one-click demo data seeder script in `scripts/`.
- Provide interactive "Demo Mode" toggle in UI for live presentation.
- **Deliverable:** Realistic, ready-to-present competitive scenario pre-loaded into Hindsight memory.

### PHASE 11 — Testing + Edge Cases
- Write unit tests for repositories, services, schemas, and API routes (`tests/backend/`).
- Write integration tests verifying the full Retain -> Recall -> Agent loop (`tests/integration/`).
- Test edge cases (missing memories, noisy data, concurrent event ingestion).
- **Deliverable:** Verified test suite ensuring robust system behavior.

### PHASE 12 — Final UX Polish + Documentation
- Refine animations, visual hierarchy, micro-interactions, and accessibility.
- Finalize submission documentation, video script/demo walkthrough, and architecture diagrams.
- **Deliverable:** Complete hackathon-ready submission package.
