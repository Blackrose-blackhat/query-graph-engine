"""API routes for query execution and graph data."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db.schema import get_connection
from services.llm import generate_sql
from services.validator import validate_sql
from services.graph import build_graph
from services.answer_generator import generate_answer

router = APIRouter()


class QueryRequest(BaseModel):
    query: str


class QueryResponse(BaseModel):
    answer: str
    data: list[dict]
    sql: str
    spec: dict | None = None


@router.post("/query", response_model=QueryResponse)
async def handle_query(req: QueryRequest):
    user_query = req.query.strip()
    if not user_query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # Step 1: Generate SQL via LLM
    try:
        sql = await generate_sql(user_query)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM service error: {str(e)}")

    # Step 2: Validate SQL
    is_valid, error = validate_sql(sql)
    if not is_valid:
        if error == "INVALID_QUERY":
            return QueryResponse(
                answer="This system only answers questions related to the dataset.",
                data=[],
                sql="",
            )
        return QueryResponse(
            answer=f"Invalid query for this dataset: {error}",
            data=[],
            sql=sql,
        )

    # Step 3: Execute SQL
    try:
        conn = get_connection()
        cursor = conn.execute(sql)
        columns = [desc[0] for desc in cursor.description]
        rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
    except Exception as e:
        return QueryResponse(
            answer=f"Query execution error: {str(e)}",
            data=[],
            sql=sql,
        )

    # Step 4: Format response
    answer = await generate_answer(user_query, rows)
    spec = None

    return QueryResponse(answer=answer, data=rows, sql=sql, spec=spec)


@router.get("/graph")
async def get_graph():
    return build_graph()
