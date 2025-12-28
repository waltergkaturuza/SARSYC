-- Drop Payload CMS document locking tables
-- Run this with: psql "your-connection-string" -f scripts/drop_locking_tables_psql.sql

-- Check if tables exist first
SELECT 
    'Checking for document locking tables...' as status,
    table_name 
FROM 
    information_schema.tables 
WHERE 
    table_schema = 'public' 
    AND table_name LIKE 'payload_locked%'
ORDER BY 
    table_name;

-- Drop the relationship table first (has foreign keys)
DROP TABLE IF EXISTS "payload_locked_documents_rels" CASCADE;

-- Drop the main locking table
DROP TABLE IF EXISTS "payload_locked_documents" CASCADE;

-- Verify tables are dropped
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Successfully dropped all document locking tables!'
        ELSE '⚠️  Warning: Some tables still exist: ' || string_agg(table_name, ', ')
    END as result
FROM 
    information_schema.tables 
WHERE 
    table_schema = 'public' 
    AND table_name LIKE 'payload_locked%';

