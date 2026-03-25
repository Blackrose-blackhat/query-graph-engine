import asyncio
from services.answer_generator import generate_answer

async def test_answer():
    question = "What are the latest 3 sales orders and their creation dates?"
    rows = [
        {"salesOrder": "123", "creationDate": "2023-01-01"},
        {"salesOrder": "124", "creationDate": "2023-01-02"},
        {"salesOrder": "125", "creationDate": "2023-01-03"},
    ]
    
    print(f"Question: {question}")
    answer = await generate_answer(question, rows)
    print(f"\\nAnswer:\\n{answer}")

if __name__ == "__main__":
    asyncio.run(test_answer())
