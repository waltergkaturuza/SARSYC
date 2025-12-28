-- Drop Payload CMS document locking tables
-- This script removes the document locking feature tables
-- Run this if you've disabled document locking with maxConcurrentEditing: 0
-- but the tables still exist and cause query errors

-- Drop the relationship table first (has foreign keys)
DROP TABLE IF EXISTS "payload_locked_documents_rels" CASCADE;

-- Drop the main locking table
DROP TABLE IF EXISTS "payload_locked_documents" CASCADE;

-- Verify tables are dropped
SELECT 
    table_name 
FROM 
    information_schema.tables 
WHERE 
    table_schema = 'public' 
    AND table_name LIKE 'payload_locked%';

