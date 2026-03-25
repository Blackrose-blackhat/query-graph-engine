import asyncio
from services.ui_generator import generate_ui_spec

async def test():
    query = "What is the total payment per customer?"
    rows = [{"name": "Alice", "total_paid": 500}, {"name": "Bob", "total_paid": 300}]
    spec = await generate_ui_spec(query, rows)
    import json
    print(json.dumps(spec, indent=2))

if __name__ == "__main__":
    asyncio.run(test())
