"""LLM service for generating natural language answers from query results."""

import httpx
import json
from services.llm import GROQ_URL, MODEL, GROQ_API_KEY

SYSTEM_PROMPT = """You are a helpful data analyst for a business system.
Your job is to receive a user's question and the raw JSON results from a database query, and provide a concise, natural language answer.

RULES:
- Answer directly and conversationally.
- Use simple Markdown formatting (e.g., bolding important numbers or names) to make it easy to read.
- DO NOT hallucinate data. Only use the provided JSON results.
- DO NOT show the raw JSON or explain the SQL query.
- Try to be concise but informative. If there are many results, summarize the top few and mention the total count.
"""

async def generate_answer(user_query: str, rows: list[dict]) -> str:
    if not GROQ_API_KEY:
        return "I found the results, but I cannot format them into a sentence because the LLM API key is not configured."
        
    if not rows:
        return "I couldn't find any data matching your request."

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
        "temperature": 0.3, # Slight temperature for conversational flow
        "max_tokens": 500,
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(GROQ_URL, json=payload, headers=headers)
            response.raise_for_status()

        data = response.json()
        return data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"Answer Generator error: {e}")
        return "I found the results, but encountered an error while trying to summarize them."
