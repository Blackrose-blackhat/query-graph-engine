"""SQL validation layer — rejects dangerous, malformed, or off-schema queries."""

import re
from db.schema import TABLES

# All known column names (unqualified) for alias-aware validation
_ALL_COLUMNS = set()
for cols in TABLES.values():
    _ALL_COLUMNS.update(cols)

# Also allow common aggregate aliases and SQL functions
_ALLOWED_FUNCTIONS = {
    "count", "sum", "avg", "min", "max", "coalesce",
    "group_concat", "distinct", "cast", "ifnull", "nullif",
    "date", "strftime", "substr", "length", "lower", "upper",
    "total", "abs", "round",
}

DANGEROUS_KEYWORDS = re.compile(
    r"\b(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE|TRUNCATE|REPLACE|ATTACH|DETACH|PRAGMA|VACUUM)\b",
    re.IGNORECASE,
)


def validate_sql(sql: str) -> tuple[bool, str]:
    """Validate SQL before execution.

    Returns (is_valid, error_message).
    """
    if not sql or not sql.strip():
        return False, "Empty query"

    sql_clean = sql.strip().rstrip(";").strip()

    if sql_clean.upper() == "INVALID_QUERY":
        return False, "INVALID_QUERY"

    # Must start with SELECT
    if not sql_clean.upper().startswith("SELECT"):
        return False, "Only SELECT queries are allowed"

    # Check for dangerous keywords
    if DANGEROUS_KEYWORDS.search(sql_clean):
        return False, "Query contains forbidden operations"

    # Check for semicolons (multi-statement injection)
    # Allow trailing semicolon but not mid-query
    if ";" in sql_clean:
        return False, "Multi-statement queries are not allowed"

    # Validate referenced tables
    # Extract table names from FROM and JOIN clauses
    table_pattern = re.compile(
        r"(?:FROM|JOIN)\s+(\w+)", re.IGNORECASE
    )
    referenced_tables = table_pattern.findall(sql_clean)

    for table in referenced_tables:
        if table.lower() not in TABLES:
            return False, f"Unknown table: {table}"

    return True, ""
