import os
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://neondb_owner:npg_jG9JPuBKqH4a@ep-dawn-boat-aqioykrx-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"

def upgrade_db():
    print("Connecting to database...")
    engine = create_engine(DATABASE_URL)
    with engine.begin() as conn:
        print("Adding height column...")
        conn.execute(text("ALTER TABLE patients ADD COLUMN IF NOT EXISTS height VARCHAR(20)"))
        
        print("Adding weight column...")
        conn.execute(text("ALTER TABLE patients ADD COLUMN IF NOT EXISTS weight VARCHAR(20)"))
        
        print("Adding bmi column...")
        conn.execute(text("ALTER TABLE patients ADD COLUMN IF NOT EXISTS bmi VARCHAR(10)"))
        
        print("Adding allergies column...")
        conn.execute(text("ALTER TABLE patients ADD COLUMN IF NOT EXISTS allergies TEXT"))
        
        print("Adding emergency_contact column...")
        conn.execute(text("ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255)"))
        
        print("Adding primary_physician column...")
        conn.execute(text("ALTER TABLE patients ADD COLUMN IF NOT EXISTS primary_physician VARCHAR(255)"))
        
    print("Database upgraded successfully.")

if __name__ == "__main__":
    upgrade_db()
