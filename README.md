# Buy or Wait?

> **An AI-assisted financial affordability agent that helps people decide whether to buy now, pay over time, wait, or walk away.**

Buy or Wait? combines a deterministic financial simulator, optional Groq LLM reasoning, and an interactive React dashboard to answer a practical question:

> **Can I afford this purchase without falling below my financial safety buffer?**

The application evaluates purchase requests against a user's balance, minimum reserve, income, expenses, payment preferences, future events, currencies, messages, and optional image evidence. It then returns an explainable recommendation and a 90-day cash-flow view.

---

## Contents

- [What the project does](#what-the-project-does)
- [Key features](#key-features)
- [Architecture](#architecture)
- [Repository structure](#repository-structure)
- [Decision lifecycle](#decision-lifecycle)
- [Decision outcomes](#decision-outcomes)
- [Data model](#data-model)
- [Quick start](#quick-start)
- [Backend API](#backend-api)
- [Generating decisions](#generating-decisions)
- [Frontend experience](#frontend-experience)
- [Evaluation](#evaluation)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Technology stack](#technology-stack)

---

## What the project does

Buy or Wait? is designed for situations where a simple account balance is not enough to make a safe purchase decision. A request may be affordable today but unsafe after rent, recurring bills, or an upcoming payment. The system therefore:

1. Loads structured financial data from CSV files.
2. Collects the request, profile, events, payment options, messages, images, and exchange rates.
3. Builds a normalized decision context.
4. Uses either precomputed/mock decisions or the Groq LLM agent.
5. Simulates the user's balance over the next 90 days.
6. Presents the result through an operations-style dashboard.

The result is not just a yes/no answer. It includes the safe amount to pay, recommended payment method, payment plan, earliest full-payment date, spending changes, and a plain-language explanation.

---

## Key features

### Financial decision engine

- Supports full payment, partial payment, installments, waiting, and rejection.
- Preserves a configurable minimum balance.
- Considers one-time and recurring financial events.
- Handles direct, inverse, and cross-currency exchange-rate conversion.
- Excludes superseded linked events from the active ledger.
- Produces a 90-day daily balance ledger.

### AI-assisted reasoning

- Sends a compiled request context to Groq.
- Supports text-only and image-assisted requests.
- Requests structured JSON output.
- Uses deterministic temperature settings.
- Retries failed LLM calls with exponential backoff.
- Falls back to a safe failure-shaped decision when processing cannot complete.

### Interactive dashboard

- Searchable request queue.
- Affordability filters.
- KPI summary strip.
- Animated Three.js cash-flow visualization.
- 90-day balance forecast.
- Verdict, payment plan, evidence, and explanation panel.
- Status-specific colors for quick operational scanning.

### Reproducible demo mode

- `mock_all_output.js` generates deterministic decisions without an API key.
- The frontend can load its initial request list from a public CSV.
- The evaluation script validates coverage and output schema.

---

## Architecture

```text
┌─────────────────────┐
│   CSV data files    │
│ profiles, requests, │
│ events, rates, etc. │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│     DataLoader      │
│ Parses and normalizes│
│ all source datasets  │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐       ┌─────────────────────┐
│   DecisionEngine    │──────>│      LLMAgent       │
│ Builds context and  │       │ Optional Groq JSON  │
│ coordinates scoring │       │ decision generation │
└──────────┬──────────┘       └─────────────────────┘
           │
           v
┌─────────────────────┐
│    output.csv       │
│ Precomputed decision│
│ results for requests│
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│    Express API      │
│ Requests, decisions,│
│ users, and ledgers  │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│ React + Vite UI     │
│ Queue, KPIs, 3D     │
│ scene, chart, detail│
└─────────────────────┘
```

The backend is CSV-backed and loads its datasets into memory on startup. The frontend initially reads the public request CSV so the dashboard can render quickly, then requests the selected decision from the backend.

---

## Repository structure

```text
.
├── backend/
│   ├── dataLoader.js              # Loads and normalizes CSV datasets
│   ├── decisionEngine.js          # Builds decision payloads
│   ├── index.js                   # Express API server
│   ├── llmAgent.js                # Groq integration and retry logic
│   ├── mock_all_output.js         # Offline deterministic output generator
│   ├── processAll.js              # Batch LLM processing pipeline
│   ├── evaluation/evaluate.js     # Output coverage/schema evaluator
│   └── package.json
├── dataset/
│   ├── requests.csv               # Purchase requests
│   ├── financial_profiles.csv     # Balances and user constraints
│   ├── financial_events.csv       # Income and expense events
│   ├── exchange_rates.csv         # Historical currency rates
│   ├── request_payment_options.csv
│   ├── messages.csv
│   ├── images.csv
│   └── output.csv                 # Generated decisions
├── evaluation/
│   ├── workflow_report.md
│   ├── usage_report.md
│   └── chat_transcript.jsonl
├── frontend/
│   ├── src/pages/Dashboard.tsx    # Main dashboard controller
│   ├── src/components/dashboard/  # Queue, KPIs, chart, 3D scene, details
│   ├── src/data/                  # Frontend request models and CSV loader
│   ├── public/requests.csv        # Browser-facing request seed data
│   └── package.json
└── README.md
```

---

## Decision lifecycle

When a request is evaluated, the backend follows this sequence:

1. **Locate the request** using its `request_id`.
2. **Find the profile** using the request's `user_id`.
3. **Create a fallback profile** when profile data is unavailable.
4. **Collect financial events** for the user.
5. **Add a mock future income event** when no events exist, allowing demo scenarios to model “affordable later.”
6. **Collect payment options, messages, and image evidence** related to the request.
7. **Attach exchange-rate data** for currency normalization.
8. **Send the compiled context to Groq**, when LLM mode is used.
9. **Persist the normalized decision** to `dataset/output.csv`.
10. **Build a 90-day ledger** using income, expenses, exchange rates, and payment-plan deductions.
11. **Return the decision and ledger** to the frontend.

The API can also serve an existing row from `output.csv` without calling the LLM again. This makes the interface usable with precomputed or mock results.

---

## Decision outcomes

| Status | Meaning | Typical method |
|---|---|---|
| `affordable_now` | The full purchase can be made while preserving the minimum balance. | `full_payment` |
| `affordable_with_plan` | The purchase is possible if payments are spread out. | `partial_payment` or `installments` |
| `affordable_later` | The user should wait for a future income event. | `wait` |
| `not_affordable` | The purchase would be unsafe under the available evidence. | `not_recommended` |

Each decision follows this eight-column output contract:

```text
request_id
amount_safe_to_pay
affordability_status
recommended_payment_method
payment_plan
earliest_date_for_full_payment
spending_changes_needed
decision_explanation
```

Payment plans use a compact pipe-separated representation:

```text
2026-09-13:500|2026-09-28:500
```

Spending changes can contain pipe-separated instructions such as:

```text
stop:restaurants|reduce_to:transport:200
```

---

## Data model

### `requests.csv`

Defines what the user wants to buy:

- Request ID and user ID
- Request date
- Request type
- Requested amount
- Desired completion date
- Partial-payment preference
- Natural-language request text

### `financial_profiles.csv`

Defines the user's financial constraints:

- Home currency
- Available balance
- Minimum balance to keep
- Accepted payment methods

### `financial_events.csv`

Defines cash-flow events:

- Event date and amount
- Currency
- Income or expense type
- Recurrence
- Flexibility
- Linked replacement event

### Supporting datasets

- `exchange_rates.csv`: currency normalization.
- `request_payment_options.csv`: financing choices.
- `messages.csv`: user-provided context.
- `images.csv`: evidence metadata and image paths.
- `output.csv`: generated decision results.

---

## Quick start

### Prerequisites

- Node.js 18 or newer
- npm
- A Groq API key for live LLM processing

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Configure the backend

Create `backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key
PORT=8000
```

`PORT` is optional and defaults to `8000`.

### 3. Generate offline demo decisions

This is the fastest way to run the project without an LLM key:

```bash
node mock_all_output.js
```

### 4. Start the backend

```bash
npm start
```

The API will be available at:

```text
http://localhost:8000
```

### 5. Install frontend dependencies

Open a second terminal:

```bash
cd frontend
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

The Vite development server is configured for port `3200`. Open the URL printed by Vite.

### 7. Optional frontend checks

```bash
npm run build
npm run lint
```

---

## Backend API

### `GET /requests`

Returns all requests loaded from `dataset/requests.csv`.

### `GET /requests/:request_id/decision`

Returns the selected request's decision, 90-day ledger, and minimum balance:

```json
{
  "decision": {
    "request_id": "request_26",
    "amount_safe_to_pay": "1200",
    "affordability_status": "affordable_now",
    "recommended_payment_method": "full_payment",
    "payment_plan": "none",
    "earliest_date_for_full_payment": "",
    "spending_changes_needed": "none",
    "decision_explanation": "..."
  },
  "ledger": [
    { "date": "2026-09-13", "balance": 4200 }
  ],
  "minimum_balance_to_keep": 1000
}
```

### `GET /users`

Returns all loaded financial profiles.

### `GET /users/:user_id/ledger`

Returns a user's 90-day ledger, minimum balance, requests, and one-time expenses.

> The request decisions in this endpoint are currently placeholders. The request-specific decision endpoint is the authoritative decision flow used by the main dashboard.

---

## Generating decisions

### Offline deterministic mode

Use this for demos, local UI work, and environments without Groq:

```bash
cd backend
node mock_all_output.js
```

The script uses deterministic user-ID-based logic to distribute requests across the four affordability statuses and rewrites `dataset/output.csv`.

### Live LLM mode

Use this to process all requests through the decision engine:

```bash
cd backend
node processAll.js
```

The process:

- Loads all CSV data.
- Processes requests in batches of ten.
- Sends each compiled context to Groq.
- Retries failures through the LLM agent.
- Writes progress to `dataset/output.csv` after each batch.

The LLM integration selects a text model for text-only requests and an image-capable model when image evidence is attached.

---

## Frontend experience

The dashboard is organized into four main areas:

1. **Request queue** — browse, search, and filter requests.
2. **KPI strip** — view totals, affordability distribution, and average safe-to-pay ratio.
3. **3D capacity scene** — explore animated incoming and outgoing cash-flow particles around the balance sphere.
4. **Detail panel** — inspect the verdict, payment method, plan, evidence, and explanation.

The forecast chart is a deterministic UI simulation of balance movement over 90 days. The backend also returns a calculated ledger for API consumers.

The frontend reads its initial request list from:

```text
frontend/public/requests.csv
```

When a request is selected, it calls the backend using:

```env
VITE_API_URL=http://localhost:8000
```

If `VITE_API_URL` is not set, the frontend defaults to `http://localhost:8000`.

---

## Evaluation

Run the workflow evaluator after generating `output.csv`:

```bash
cd backend/evaluation
node evaluate.js
```

The evaluator writes:

```text
evaluation/workflow_report.md
```

It reports:

- Total input requests.
- Total processed outputs.
- Missing output rows.
- Affordability breakdown.
- Recommended payment methods.
- Eight-column schema compliance.

---

## Deployment

### Backend on Render

Create a Node.js web service with:

```text
Root directory: backend
Build command: npm install
Start command: npm start
```

Add the following environment variable:

```text
GROQ_API_KEY
```

### Frontend on Vercel

Import the repository and set:

```text
Root directory: frontend
```

Add:

```text
VITE_API_URL=https://your-render-backend.example.com
```

The frontend must point to the deployed backend rather than its local default.

---

## Configuration

| Variable | Required | Default | Purpose |
|---|---:|---|---|
| `GROQ_API_KEY` | Only for live LLM mode | — | Authenticates Groq requests |
| `PORT` | No | `8000` | Backend HTTP port |
| `VITE_API_URL` | No | `http://localhost:8000` | Backend URL used by the frontend |

---

## Troubleshooting

### The dashboard loads but analysis fails

Confirm that:

1. The backend is running on port `8000`.
2. `VITE_API_URL` points to the backend.
3. `dataset/output.csv` exists.
4. The request ID exists in `dataset/requests.csv`.

### Live processing reports `GROQ_API_KEY not set`

Create `backend/.env` and add a valid key:

```env
GROQ_API_KEY=your_groq_api_key
```

Restart the backend or processing command after changing environment variables.

### The frontend shows old decisions

Regenerate the output file:

```bash
cd backend
node mock_all_output.js
```

Then restart the backend so it reloads the CSV datasets.

### The frontend cannot connect in production

Set `VITE_API_URL` in the frontend deployment environment and rebuild/redeploy the frontend. Vite environment variables are embedded at build time.

---

## Technology stack

### Backend

- Node.js
- Express
- CSV Parser
- Groq SDK
- dotenv
- Prisma dependencies reserved for future persistence

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Three.js
- React Three Fiber ecosystem
- Recharts
- Zustand
- Framer Motion
- Tailwind CSS/PostCSS

---

## Project status

The current implementation is a polished, CSV-backed prototype with:

- A working affordability API.
- Optional LLM processing.
- Deterministic offline demo generation.
- A 90-day financial simulation.
- An interactive dashboard for exploring decisions.
- Automated output coverage and schema evaluation.

The runtime currently uses CSV files as its data store and keeps loaded data in memory. A future production version could add persistent storage, authentication, stricter schema validation, server-side forecast integration, and a shared decision cache.
