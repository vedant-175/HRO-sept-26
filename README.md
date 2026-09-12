# Buy or Wait? Financial Affordability Agent

A complete deterministic decision engine and interactive 3D web application to answer the question: "Can I afford this?"

## Project Structure
- `backend/`: Node.js-based decision engine, deterministic simulator, Groq LLM extraction layer, and Express API server.
- `frontend/`: React + Vite + TypeScript interactive 3D UI using React Three Fiber.
- `dataset/`: Contains the CSV datasets and media.
- `evaluation/`: Contains JS scripts to evaluate and generate usage reports.

## Setup and Run Instructions

### Prerequisites
- Node.js (v18+) & npm

### Backend
1. `cd backend`
2. Install dependencies: `npm install`
3. Add a `.env` file with `GROQ_API_KEY=your_key` for the LLM processing.
4. (Optional) Run the decision engine generator to populate `output.csv`: `node mock_all_output.js`
5. Start the API server: `node index.js` (runs on http://localhost:8000)

### Frontend
1. `cd frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Open the browser at the provided localhost URL (usually http://localhost:3200) to see the 3D dashboard.

## Tests & Evaluation
- To run the evaluation and regenerate the workflow report: 
  `cd backend/evaluation`
  `node evaluate.js`
- Check `evaluation/workflow_report.md` for the updated result statistics.
