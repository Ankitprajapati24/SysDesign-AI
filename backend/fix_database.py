"""
Run this script to fix the database schema.
It adds the missing hashed_password column to the users table.

Usage: python fix_database.py
"""
import psycopg2
from app.core.config import settings

def fix_database():
    conn = None
    try:
        # Connect with SSL (required by Neon)
        conn = psycopg2.connect(settings.DATABASE_URL)
        conn.autocommit = True
        cur = conn.cursor()

        # Check if hashed_password column exists
        cur.execute("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'users' AND column_name = 'hashed_password'
            )
        """)
        column_exists = cur.fetchone()[0]

        if column_exists:
            print("[OK] Column 'hashed_password' already exists in users table. No action needed.")
        else:
            print("[FIX] Adding 'hashed_password' column to users table...")
            cur.execute("""
                ALTER TABLE users ADD COLUMN hashed_password VARCHAR NOT NULL DEFAULT ''
            """)
            print("[OK] Column 'hashed_password' added successfully.")

        # Also check for refresh_tokens table
        cur.execute("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_name = 'refresh_tokens'
            )
        """)
        refresh_table_exists = cur.fetchone()[0]

        if not refresh_table_exists:
            print("[FIX] Creating 'refresh_tokens' table...")
            cur.execute("""
                CREATE TABLE refresh_tokens (
                    id SERIAL PRIMARY KEY,
                    token VARCHAR NOT NULL UNIQUE,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    expires_at TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW(),
                    is_revoked BOOLEAN DEFAULT FALSE
                )
            """)
            cur.execute("CREATE INDEX ix_refresh_tokens_token ON refresh_tokens(token)")
            print("[OK] Table 'refresh_tokens' created successfully.")
        else:
            print("[OK] Table 'refresh_tokens' already exists.")

        # Check for projects table
        cur.execute("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_name = 'projects'
            )
        """)
        projects_exists = cur.fetchone()[0]

        if not projects_exists:
            print("[FIX] Creating 'projects' table...")
            cur.execute("""
                CREATE TABLE projects (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR NOT NULL,
                    description VARCHAR,
                    user_id INTEGER NOT NULL REFERENCES users.id ON DELETE CASCADE,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """)
            print("[OK] Table 'projects' created successfully.")
        else:
            print("[OK] Table 'projects' already exists.")

        # Check for generated_artifacts table
        cur.execute("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_name = 'generated_artifacts'
            )
        """)
        artifacts_exists = cur.fetchone()[0]

        if not artifacts_exists:
            print("[FIX] Creating 'generated_artifacts' table...")
            cur.execute("""
                CREATE TABLE generated_artifacts (
                    id SERIAL PRIMARY KEY,
                    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                    artifact_type VARCHAR NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """)
            print("[OK] Table 'generated_artifacts' created successfully.")
        else:
            print("[OK] Table 'generated_artifacts' already exists.")

        # Verify final state
        cur.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        """)
        columns = cur.fetchall()
        print("\n--- users table columns ---")
        for col in columns:
            print(f"  {col[0]} ({col[1]}) {'NULL' if col[2] == 'YES' else 'NOT NULL'}")

        print("\n[SUCCESS] Database schema is now in sync with the SQLAlchemy models.")

    except Exception as e:
        print(f"[ERROR] {e}")
        raise
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    fix_database()
