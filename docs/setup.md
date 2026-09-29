# Backend Setup & Development Guide

This guide details the setup and execution workflow for the **Competitive Intelligence Agent** backend foundation.

---

## 1. Prerequisites
- **Python:** 3.11 or higher
- **Virtual Environment:** `venv` or `uv`
- **Database:** SQLite (default for development) or PostgreSQL

---

## 2. Environment Setup

### Step A: Navigate to backend directory
```bash
cd backend
```

### Step B: Create and activate virtual environment
```bash
# Windows
python -m venv .venv
.\.venv\Scripts\activate

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

### Step C: Install dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 3. Environment Configuration

Copy `.env.example` from project root to `.env`:

```bash
cp ../.env.example ../.env
```

Ensure `DATABASE_URL` is configured:
- **SQLite (Default local dev):** `DATABASE_URL=sqlite:///./competitive_intelligence.db`
- **PostgreSQL (Production):** `DATABASE_URL=postgresql://user:password@localhost:5432/competitive_intelligence`

---

## 4. Hindsight Persistent Memory Setup

### Step A: Configure Environment Variables
Add your Hindsight credentials to `.env`:

```ini
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_API_KEY=your_actual_hindsight_api_key_here
HINDSIGHT_BANK_ID=competitive-intelligence
HINDSIGHT_TIMEOUT_SECONDS=10.0
```

### Step B: Run Memory Bank Setup Script
Verify connection and create the `competitive-intelligence` memory bank:

```bash
python scripts/setup_hindsight.py
```

### Step C: Test Connectivity & Memory Operations
Start FastAPI server and run health check:
- Health Check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
- Dev Test Retain: `POST http://localhost:8000/api/v1/memory/test`
- Dev Test Recall: `GET http://localhost:8000/api/v1/memory/test/recall?q=pricing`

---

## 5. Run Database Migrations

Apply Alembic migrations to create backend tables (`competitors`, `competitor_events`, `event_sources`):

```bash
alembic upgrade head
```

---

## 6. Start Backend Application

Launch FastAPI with auto-reload:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Access Interactive Documentation:
- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## 7. Run Test Suite

Execute pytest unit and endpoint integration tests:

```bash
pytest -v
```
