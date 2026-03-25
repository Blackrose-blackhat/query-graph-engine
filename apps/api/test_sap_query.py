import asyncio
from services.llm import generate_sql

async def test_llm():
    queries = [
        "What are the latest 3 sales orders and their creation dates?",
        "Show me all the products in sales order 740506?",
        "Which business partner has the highest total net amount across all sales orders?"
    ]
    
    for q in queries:
        print(f"\\n--- Query: {q}")
        sql = await generate_sql(q)
        print(f"SQL:\\n{sql}")

if __name__ == "__main__":
    asyncio.run(test_llm())
