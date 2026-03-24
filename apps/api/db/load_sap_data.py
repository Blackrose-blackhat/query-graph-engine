import os
import json
import sqlite3
import glob
import sys

# Ensure we can import from the api folder
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db.schema import TABLES, init_db, get_connection

# Path to the sap-o2c-data directory assuming it's up a few levels
SAP_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "sap-o2c-data")

def load_table(conn: sqlite3.Connection, table_name: str, folder_name: str):
    columns = TABLES.get(table_name)
    if not columns:
        print(f"Skipping {folder_name}: not defined in TABLES.")
        return
    
    dir_path = os.path.join(SAP_DATA_DIR, folder_name)
    if not os.path.exists(dir_path):
        print(f"Directory {dir_path} not found.")
        return
        
    print(f"Loading {table_name} from {dir_path}...")
    
    placeholders = ",".join(["?"] * len(columns))
    insert_sql = f"INSERT OR REPLACE INTO {table_name} ({','.join(columns)}) VALUES ({placeholders})"
    
    cursor = conn.cursor()
    count = 0
    # read all jsonl parts
    for filepath in glob.glob(os.path.join(dir_path, "*.jsonl")):
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                record = json.loads(line)
                row_data = []
                for col in columns:
                    val = record.get(col)
                    row_data.append(val)
                cursor.execute(insert_sql, row_data)
                count += 1
                
    conn.commit()
    print(f"Loaded {count} rows into {table_name}")

def main():
    print("Initializing database...")
    init_db()
    
    conn = get_connection()
    
    folders = [
        "business_partners",
        "sales_order_headers",
        "products",
        "sales_order_items",
        "outbound_delivery_headers",
        "billing_document_headers"
    ]
    
    for folder in folders:
        load_table(conn, folder, folder)
        
    conn.close()
    print("Data loading complete.")

if __name__ == "__main__":
    main()
