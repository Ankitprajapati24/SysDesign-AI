-- Fix: Add missing hashed_password column to users table
-- Run this against your Neon PostgreSQL database

-- Check if the column already exists (safe to run multiple times)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'hashed_password'
    ) THEN
        ALTER TABLE users ADD COLUMN hashed_password VARCHAR NOT NULL DEFAULT '';
        RAISE NOTICE 'Column hashed_password added successfully';
    ELSE
        RAISE NOTICE 'Column hashed_password already exists';
    END IF;
END $$;
