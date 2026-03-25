"""Graph model builder — converts relational data into nodes and edges."""

from db.schema import get_connection, RELATIONSHIPS

# Color scheme per entity type
NODE_COLORS = {
    "business_partner": "#6366f1",   # indigo
    "sales_order": "#f59e0b",      # amber
    "sales_order_item": "#8b5cf6", # violet
    "product": "#10b981",    # emerald
    "delivery": "#3b82f6",   # blue
    "billing": "#ef4444",    # red
}

ENTITY_CONFIG = {
    "business_partners": ("business_partner", "businessPartnerFullName", "businessPartner"),
    "sales_order_headers": ("sales_order", "creationDate", "salesOrder"),
    "sales_order_items": ("sales_order_item", "salesOrderItem", "salesOrderItem"), 
    "products": ("product", "productType", "product"),
    "outbound_delivery_headers": ("delivery", "creationDate", "deliveryDocument"),
    "billing_document_headers": ("billing", "billingDocumentDate", "billingDocument"),
}

def get_node_id(entity_type, row_dict):
    if entity_type == "sales_order_item":
        return f"{entity_type}_{row_dict['salesOrder']}_{row_dict['salesOrderItem']}"
    for table, config in ENTITY_CONFIG.items():
        if config[0] == entity_type:
            return f"{entity_type}_{row_dict[config[2]]}"
    return f"{entity_type}_unknown"

def build_graph() -> dict:
    """Build the full graph from database contents."""
    conn = get_connection()
    nodes = []
    edges = []

    for table, (entity_type, label_col, id_col) in ENTITY_CONFIG.items():
        rows = conn.execute(f"SELECT * FROM {table}").fetchall()
        for row in rows:
            row_dict = dict(row)
            node_id = get_node_id(entity_type, row_dict)
            pk_val = row_dict[id_col]
            if entity_type == "sales_order_item":
                pk_val = f"{row_dict['salesOrder']}_{row_dict['salesOrderItem']}"
                
            label = str(row_dict.get(label_col, pk_val))
            nodes.append({
                "id": node_id,
                "label": f"{entity_type.replace('_', ' ').title()} {pk_val}: {label}",
                "type": entity_type,
                "color": NODE_COLORS.get(entity_type, "#999999"),
                "metadata": row_dict,
            })

    # Build edges from relationships
    for src_table, src_col, tgt_table, tgt_col, rel_type in RELATIONSHIPS:
        src_type = ENTITY_CONFIG[src_table][0]
        tgt_type = ENTITY_CONFIG[tgt_table][0]

        rows = conn.execute(f"SELECT * FROM {src_table}").fetchall()
        for row in rows:
            row_dict = dict(row)
            src_node_id = get_node_id(src_type, row_dict)
            fk_value = row_dict.get(src_col)

            if fk_value is None:
                continue

            children = conn.execute(
                f"SELECT * FROM {tgt_table} WHERE {tgt_col} = ?",
                (fk_value,)
            ).fetchall()
            for child in children:
                child_dict = dict(child)
                tgt_node_id = get_node_id(tgt_type, child_dict)
                edges.append({
                    "source": src_node_id,
                    "target": tgt_node_id,
                    "type": rel_type,
                })

    conn.close()
    return {"nodes": nodes, "edges": edges}
