"""Response formatter — converts raw SQL results into natural language answers."""


def format_response(user_query: str, sql: str, rows: list[dict]) -> str:
    """Generate a concise natural language answer from query results."""
    if not rows:
        return "No results found for your query."

    count = len(rows)
    columns = list(rows[0].keys()) if rows else []

    # Single scalar result
    if count == 1 and len(columns) == 1:
        val = rows[0][columns[0]]
        return f"The result is: {val}"

    # Single row, multiple columns (e.g., trace result)
    if count == 1:
        parts = [f"{col}: {rows[0][col]}" for col in columns]
        return "Result: " + ", ".join(parts)

    # Aggregation with named column (e.g., name + count)
    if len(columns) == 2 and any("count" in c.lower() or "total" in c.lower() or "sum" in c.lower() or "amount" in c.lower() for c in columns):
        label_col = columns[0]
        value_col = columns[1]
        lines = [f"Found {count} results:"]
        for row in rows[:15]:  # Cap display at 15
            lines.append(f"  {row[label_col]}: {row[value_col]}")
        if count > 15:
            lines.append(f"  ... and {count - 15} more")
        return "\n".join(lines)

    # ID-only results (e.g., list of order IDs)
    if len(columns) == 1:
        vals = [str(row[columns[0]]) for row in rows[:20]]
        return f"Found {count} result(s): {', '.join(vals)}"

    # General table result
    lines = [f"Found {count} result(s):"]
    for row in rows[:10]:
        parts = [f"{col}: {row[col]}" for col in columns]
        lines.append("  " + " | ".join(parts))
    if count > 10:
        lines.append(f"  ... and {count - 10} more")
    return "\n".join(lines)
