# Graph-Based Data Query System

A system that converts relational business data into a logical graph model, allows natural language querying via LLM-generated SQL, and visualizes entity relationships.

## Architecture

```
User Question → LLM (strict prompt) → SQL → Validation → SQLite → Response Formatter → UI
```

**Backend**: Python FastAPI + SQLite
**Frontend**: React (Vite) + TailwindCSS + react-force-graph-2d
**LLM**: Groq API (Llama 3.3 70B) with temperature=0

### Data Flow

1. User submits natural language query via chat UI
2. Backend sends query to Groq LLM with a strict system prompt containing the full schema
3. LLM returns raw SQL (or `INVALID_QUERY`)
4. SQL passes through validation layer (rejects DML, unknown tables, multi-statement injection)
5. Validated SQL executes against SQLite
6. Response formatter converts rows into natural language + structured data
7. Frontend highlights relevant graph nodes based on result entity IDs

## Graph Model

Relational tables are projected into a logical graph:

| Node Type  | Source Table  | Relationships                    |
|------------|---------------|----------------------------------|
| Customer   | customers     | PLACED → Order, LOCATED_AT → Address |
| Order      | orders        | CONTAINS → OrderItem, FULFILLED_BY → Delivery |
| OrderItem  | order_items   | OF_PRODUCT → Product             |
| Product    | products      | -                                |
| Delivery   | deliveries    | BILLED_BY → Invoice              |
| Invoice    | invoices      | PAID_BY → Payment                |
| Payment    | payments      | -                                |

The graph is built at runtime from actual DB rows. Every FK becomes a directed edge. This means broken flows (e.g., delivered but not billed) are visible as nodes without expected outbound edges.

## LLM Prompt Design

The system prompt is **deterministic by design**:

- Temperature set to 0
- System prompt contains the complete schema with column names
- 5 few-shot examples covering common query patterns (aggregation, joins, LEFT JOINs, flow tracing)
- Output constrained to raw SQL only — no markdown, no explanations
- Irrelevant queries return the literal string `INVALID_QUERY`
- Code-fence stripping as a safety net if LLM wraps output

## SQL Validation Strategy

Three-layer defense before any SQL reaches the database:

1. **Keyword blocklist**: Regex rejects DROP, DELETE, UPDATE, INSERT, ALTER, CREATE, TRUNCATE, etc.
2. **Structure check**: Must start with SELECT; no semicolons mid-query (prevents injection via stacked statements)
3. **Schema validation**: Extracts table names from FROM/JOIN clauses and rejects any not in the known schema

If validation fails, the user gets a safe error message — the SQL never executes.

## Seed Data

The database is pre-seeded with intentional gaps to demonstrate broken flow detection:

- Orders 10, 11: placed but never delivered
- Deliveries 8, 9 (orders 8, 9): delivered but never billed
- Invoice 8 (order 12): billed but never paid

## Setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env with your Groq API key
cp .env.example .env
# Edit .env and add your key from https://console.groq.com

python main.py
# Runs on http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## API Endpoints

| Method | Path        | Description                    |
|--------|-------------|--------------------------------|
| POST   | /api/query  | Natural language → SQL → results |
| GET    | /api/graph  | Full graph nodes + edges       |

### POST /api/query

Request: `{ "query": "Which products have the most invoices?" }`

Response:
```json
{
  "answer": "Found 8 results:\n  Laptop: 3\n  ...",
  "data": [{"name": "Laptop", "invoice_count": 3}, ...],
  "sql": "SELECT p.name, COUNT(i.id) ..."
}
```

## Tradeoffs

| Decision | Rationale |
|----------|-----------|
| SQLite over PostgreSQL | Zero-config for MVP; same SQL semantics for this schema |
| Groq over OpenAI | Free tier, fast inference (Llama 3.3 70B is strong at SQL) |
| Runtime graph building | Ensures graph always reflects actual DB state; no sync issues |
| No ORM | Direct SQL for transparency; schema is small and stable |
| 2D force graph over 3D | Lower bundle size, works on all devices, sufficient for this entity count |
| Temperature 0 | Deterministic SQL generation; reproducible results |
