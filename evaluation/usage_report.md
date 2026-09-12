# BuyWait AI - Evaluation & Usage Report

## Output Metrics
- **Total Requests Processed**: 250 requests processed via the autonomous financial decision engine.
- **Data Analyzed**:
  - `requests.csv`
  - `financial_profiles.csv`
  - `financial_events.csv`
  - `messages.csv`
  - `images.csv`
  - `request_payment_options.csv`
  - `exchange_rates.csv`

## Model Usage & Sub-Agents
The system utilizes a single specialized LLM Master Agent powered by Groq's high-speed inference endpoints to perform the unified underwriting logic.

1. **Master Underwriting Agent**:
   - **Model**: `openai/gpt-oss-120b` (Updated from hardcoded Groq models that were decommissioned/unavailable for this account, e.g. `llama-3.1-8b-instant`).
   - **Purpose**: Acts as the centralized decision engine. It evaluates the unified data payload containing financial profile, upcoming events, manual message overrides, images, and exchange rates. It executes complex conditional logic to output JSON containing exactly the 8 specified columns.

## Performance
The LLM Master Agent successfully validated constraints against the 250 test cases. To optimize API usage, we implemented a robust pipeline that bypasses LLM calls when a user profile is missing, outputting a default fallback result. The script also leverages file I/O batching, ensuring progress is tracked appropriately.

## Build Artifacts
- **Frontend Dashboard**: A responsive Vite/React application available at `http://localhost:5173/` and `http://localhost:5173/river`. The application utilizes the "Obsidian Kinetic" futuristic dark mode UI theme.
- **Backend**: FastAPI backend serving the LLM decision planning logic on `http://localhost:8000/`.
- **Output CSV**: `dataset/output.csv` generated matching the strict format constraints (8 columns) of the problem.
