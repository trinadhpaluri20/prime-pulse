# Competitive Intern

**AI Strategic Intelligence Platform**

> AI Strategic Intelligence Platform for monitoring competitor activity, preserving historical context, detecting patterns, and generating competitive intelligence.

---

## 1. Executive Summary

**Competitive Intern** is an enterprise-grade AI strategic intelligence platform that monitors competitor movements, preserves continuous historical context, compares current market actions with past behavior, detects precursor patterns, and generates actionable competitive intelligence.

### Key Capabilities:
- **Executive Dashboard:** High-level strategic KPIs, multi-competitor historical activity charts, executive intelligence briefs, and recent signals.
- **Historical Timeline:** Chronological event feed spanning 6 months with multi-tier filtering, search, and precursor pattern sequencing.
- **AI Strategic Insights:** Pattern detection, market trends, unusual behaviors, and historical precedent linkages backed by multi-event evidence.
- **Smart Alerts:** Real-time and historical triggers with urgency prioritization, why-it-matters rationales, and read/unread state management.
- **AI Chat Boundary:** Structured natural-language query interface returning intelligence summaries, verified facts, observations, and confidence scores.

---

## 2. Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Lucide Icons, Recharts
- **Backend:** Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0
- **Database:** PostgreSQL (with SQLite local fallback support)
- **API Documentation:** OpenAPI / Swagger (`/docs`), ReDoc (`/redoc`)
- **Future AI Integrations (Planned for Phase 8+):** Groq LLM, Hindsight Persistent Memory Layer

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React + Vite Frontend                │
│                 (http://localhost:3000)                 │
└────────────────────────────┬────────────────────────────┘
                             │ REST / JSON (VITE_API_URL)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    FastAPI Backend                      │
│                 (http://localhost:8000)                 │
│                                                         │
│  ├── /api/health              ├── /api/timeline         │
│  ├── /api/competitors         ├── /api/insights         │
│  ├── /api/activities          ├── /api/alerts           │
│  └── /api/dashboard           └── /api/chat             │
└────────────────────────────┬────────────────────────────┘
                             │ SQLAlchemy 2.0 ORM
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                    │
│                                                         │
│  ├── competitors              ├── insights              │
│  ├── activities               ├── alerts                │
│  └── sources                                            │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema (PostgreSQL / SQLAlchemy)

The database utilizes a clean relational model with foreign key constraints, cascading deletes, and strategic indexes:

1. **`competitors` Table:**
   - `id` (PK, Serial)
   - `name` (String, Indexed)
   - `website` (String)
   - `description` (Text)
   - `status` (String: active, inactive)
   - `industry` (String)
   - `created_at`, `updated_at` (DateTime with timezone)

2. **`sources` Table:**
   - `id` (PK, Serial)
   - `name` (String)
   - `url` (String)
   - `source_type` (String: website, product_page, careers, news, social, other)
   - `created_at` (DateTime with timezone)

3. **`activities` Table:**
   - `id` (PK, Serial)
   - `competitor_id` (FK → `competitors.id`)
   - `source_id` (FK → `sources.id`)
   - `activity_type` (String: pricing, product, hiring, marketing, website)
   - `title` (String)
   - `description` (Text)
   - `importance` (String: high, medium, low)
   - `detected_at` (DateTime with timezone, Indexed)
   - `created_at` (DateTime with timezone)

4. **`insights` Table:**
   - `id` (PK, Serial)
   - `type` (String: pattern, trend, unusual, historical)
   - `title` (String)
   - `description` (Text)
   - `competitor_id` (FK → `competitors.id`, Nullable)
   - `confidence` (Float, 0.0 – 1.0)
   - `evidence_count` (Integer)
   - `priority` (String: high, medium, low)
   - `timeframe_days` (Integer)
   - `evidence_data` (Text/JSON: facts, observations, sequence)
   - `created_at`, `updated_at` (DateTime with timezone)

5. **`alerts` Table:**
   - `id` (PK, Serial)
   - `competitor_id` (FK → `competitors.id`)
   - `title` (String)
   - `description` (Text)
   - `priority` (String: high, medium, low)
   - `alert_type` (String: activity_spike, pattern, pricing, product, website, hiring, marketing)
   - `historical_evidence_count` (Integer)
   - `is_read` (Boolean, Indexed)
   - `why_it_matters` (Text)
   - `created_at`, `updated_at` (DateTime with timezone)

---

## 5. Environment Configuration

### Backend Environment (`backend/.env`):
Create `backend/.env` (or copy from `backend/.env.example`):
```bash
# Core API Settings
APP_NAME="Competitive Intern API"
APP_ENV=development
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:3000

# PostgreSQL Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/competitive_intern

# Local SQLite fallback (if PostgreSQL is not running locally)
# DATABASE_URL=sqlite:///./competitive_intelligence.db
```

### Frontend Environment (`frontend/.env`):
Create `frontend/.env` (or copy from `frontend/.env.example`):
```bash
VITE_API_URL=http://localhost:8000/api
VITE_API_BASE_URL=http://localhost:8000
```

---

## 6. Installation & Quickstart

### Prerequisites:
- **Node.js** (v18+) and `npm`
- **Python** (3.11+) and `pip`
- **PostgreSQL** (v14+ recommended) or SQLite for quick local trials

---

### Step 1: Backend Setup & Database Initialization

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv .venv
   .venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Populate realistic 6-month seed data (creates all tables and inserts 4 competitors, 6 sources, 34 activities, 7 insights, and 5 alerts):
   ```bash
   python -m app.database.seed
   ```

5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

6. Verify backend health in your browser or terminal:
   ```bash
   curl http://localhost:8000/api/health
   # Response: {"status":"ok","service":"Competitive Intern API","database":"connected"}
   ```

---

### Step 2: Frontend Setup

1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev -- --host 127.0.0.1 --port 3000
   ```

4. Open `http://localhost:3000` in your web browser.

---

## 7. API Reference (`/api`)

FastAPI automatically generates interactive documentation accessible at:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### Primary Endpoints:

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/health` | Verifies API process and Database connection status |
| **Competitors** | `GET` | `/api/competitors` | List all tracked competitors (supports status filter) |
| | `GET` | `/api/competitors/{id}` | Get competitor details |
| | `POST` | `/api/competitors` | Create a new competitor |
| | `PUT` | `/api/competitors/{id}` | Update competitor |
| | `DELETE` | `/api/competitors/{id}` | Delete competitor |
| **Activities** | `GET` | `/api/activities` | List activities with filters (`competitor`, `activity_type`, `importance`, `start_date`, `end_date`, `search`) |
| | `GET` | `/api/activities/{id}` | Get activity details |
| | `POST` | `/api/activities` | Record a competitor activity |
| | `GET` | `/api/competitors/{id}/activities` | Get activities for a specific competitor |
| **Dashboard** | `GET` | `/api/dashboard/summary` | Top-level KPI counts (`competitors_tracked`, `changes_detected`, `patterns_detected`, `active_alerts`) |
| | `GET` | `/api/dashboard/activity` | Historical activity volume for Recharts (`7 days`, `30 days`, `6 months`) |
| | `GET` | `/api/dashboard/brief` | Executive intelligence synthesis and precursor analysis |
| **Timeline** | `GET` | `/api/timeline` | Normalized chronological events with historical precedent context |
| **Insights** | `GET` | `/api/insights` | Strategic insights filtered by `type`, `competitor`, `priority`, `search` |
| | `GET` | `/api/insights/{id}` | Retrieve insight detail |
| | `GET` | `/api/insights/{id}/evidence` | Supporting historical events and multi-step sequence validation |
| **Alerts** | `GET` | `/api/alerts` | Filtered alerts (`status`, `priority`, `competitor`, `alert_type`, `search`) |
| | `GET` | `/api/alerts/{id}` | Retrieve alert detail |
| | `PATCH` | `/api/alerts/{id}/read` | Mark alert as read / unread |
| | `PATCH` | `/api/alerts/read-all` | Mark all unread alerts as read |
| **AI Chat** | `POST` | `/api/chat` | Service boundary for conversational intelligence and facts synthesis |

---

## 8. Graceful Frontend Fallback Architecture

To ensure high availability and smooth local developer workflows:
- Frontend API services (`src/services/`) wrap every network call in robust `try...catch` blocks with timeout guards.
- If the backend is temporarily offline or undergoing migration, all five product views (`Dashboard`, `Timeline`, `AI Insights`, `AI Chat`, `Smart Alerts`) seamlessly fallback to verified local mock datasets.
- The UI never displays blank screens or unhandled exceptions.

---

## 9. Security & Production Best Practices

- **Zero Credentials in Source Code:** All secret keys and database URLs are loaded strictly from environment variables.
- **Strict Parameterized Queries:** SQLAlchemy 2.0 ORM prevents SQL injection vulnerabilities.
- **Input Validation:** Pydantic v2 schemas enforce validation and sanitization on all incoming requests.
- **Configurable CORS:** Frontend origin is strictly verified against environment variables.
- **Sanitized Error Responses:** Internal stack traces and server filepaths are never leaked in API error payloads.
