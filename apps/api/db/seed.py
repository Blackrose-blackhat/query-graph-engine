"""Database seeding logic."""

from db.load_sap_data import main as load_sap

def seed():
    print("Starting database seeding...")
    load_sap()
    print("Seeding complete.")

if __name__ == "__main__":
    seed()
