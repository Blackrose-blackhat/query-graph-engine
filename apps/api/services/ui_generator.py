"""LLM service for generating json-render UI specs from query results."""

import httpx
from pydantic import BaseModel
from services.llm import GROQ_URL, MODEL, GROQ_API_KEY
import json

SYSTEM_PROMPT = """You are a UI visualization expert for a data query system.
Your job is to take raw database query results and the user's original question, and generate a UI specification using the `json-render` generative UI format.

You must choose the best component from the following catalog to display the data:
1. `DataTable`: Best for displaying raw tabular data.
   - Props: `columns` (array of strings), `rows` (array of arrays of values).
2. `MetricCard`: Best for displaying a single important number (e.g., total amount, count).
   - Props: `title` (string), `value` (string or number).
3. `BarChart`: Best for comparing values across categories (e.g., sales per customer, invoices per product).
   - Props: `data` (array of objects), `xAxisKey` (string), `barKey` (string).

RULES:
- ONLY output valid JSON.
- DO NOT use any markdown or code blocks.
- DO NOT explain yourself.
- The root of the JSON must be a single element.

OUTPUT FORMAT:
{
  "root": "result_ui",
  "elements": {
    "result_ui": {
      "type": "<COMPONENT_NAME>",
      "props": { ... }
    }
  }
}
"""

async def generate_ui_spec(user_query: str, rows: list[dict]) -> dict | None:
    if not GROQ_API_KEY:
        return None
        
    if not rows:
        return None

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    
    # We send a slice of the rows to avoid large context issues
    sample_rows = rows[:50]
    
    user_content = f"Question: {user_query}\nResults:\n{json.dumps(sample_rows)}"

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        "temperature": 0,
        "response_format": {"type": "json_object"},
        "max_tokens": 1000,
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(GROQ_URL, json=payload, headers=headers)
            response.raise_for_status()

        data = response.json()
        raw = data["choices"][0]["message"]["content"].strip()
        
        # Ensure it's valid JSON
        result_spec = json.loads(raw)
        return result_spec
    except Exception as e:
        print(f"UI Generator error: {e}")
        return None
