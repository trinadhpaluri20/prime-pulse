# Code Quality & Hackathon Design Standards

## Project Development Standards

To ensure high technical quality, maintainability, and security throughout the hackathon lifecycle, all code added to this project must strictly adhere to the following standards:

### 1. Code Quality & Architecture
- **Strict Typing:** 
  - Python: Enforce Python type hints (`mypy` compliant) across all backend modules, parameters, and return types.
  - TypeScript: Use strict TypeScript typing without `any` overrides in the frontend application.
- **Modular Design:** Divide backend code into clear, single-responsibility layers (`api`, `agents`, `core`, `db`, `models`, `repositories`, `schemas`, `services`, `utils`).
- **Small Maintainable Modules:** Keep functions concise and files focused on a single responsibility.
- **Meaningful Naming:** Use clear, self-documenting variable, function, and class names.
- **Input Validation & Error Handling:** Validate all external inputs using Pydantic schemas on the backend and Zod/TypeScript schemas on the frontend. Handle errors gracefully with explicit exception classes.

### 2. Security & Environment Configuration
- **No Hardcoded Secrets:** Never hardcode API keys, passwords, connection strings, or environment-specific tokens in source files or git history.
- **Environment-based Configuration:** All configurable settings (ports, database URIs, API keys, Hindsight parameters) must be loaded dynamically from environment variables (`.env`).
- **Git Security:** Ensure `.env` and sensitive local configuration files remain listed in `.gitignore`.

### 3. Honesty & Technical Integrity
- **No Fake APIs:** Do not write mock or fake API endpoints that simulate functionality while claiming to be real.
- **No Fake Hindsight Responses:** Hindsight persistent memory must be integrated using official client SDKs/APIs. Do not stub out memory queries with static JSON responses.
- **No Fabricated Data as Real:** Clearly label demo datasets as seed/demo data. Never present fabricated responses as live memory or real-time web intelligence.
- **No Unnecessary Dependencies:** Keep dependencies lean and justified. Avoid bloat.

### 4. Testing & Verification
- **Test Coverage:** Maintain tests for core business logic, Pydantic schemas, database repositories, and agent workflows in `tests/`.
- **Empirical Verification:** Never declare a feature or fix complete without running verification scripts or automated test commands.

---

## Hackathon Design Principles

Every phase of development will be evaluated against five core design principles aligned with the judging criteria:

### 1. Innovation (30%)
> *The product must be more than a chatbot.*
- We are building a memory-driven intelligence engine, not a generic Q&A box. The system actively connects competitor events across time horizons to detect signals and strategy shifts.

### 2. Memory (25%)
> *Hindsight must eventually be central to the product.*
- Persistent memory is not an afterthought or optional plugin—it is the core memory brain powering event retention, context recall, and timeline pattern recognition.

### 3. Technical Quality (20%)
> *The implementation must be modular, testable, secure, and maintainable.*
- Clean architecture, strict static typing, robust error handling, isolated service components, and comprehensive test coverage guarantee enterprise-grade technical execution.

### 4. User Experience (15%)
> *The value should be understandable quickly.*
- Strategic value must be immediately clear through visual timelines, competitive signal badges, clear executive summaries, and interactive memory trace inspection.

### 5. Real-world Impact (10%)
> *The product should solve a genuine competitive intelligence problem.*
- The solution directly addresses high-stakes executive pain points: tracking market moves, preventing blindspots, understanding competitor trajectory, and formulating proactive counter-strategies.
