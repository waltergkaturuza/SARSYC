-- =====================================================
-- Fix: Assign abstract 50 to reviewer 3 (waltergkaturuza@gmail.com)
-- Run the ENTIRE script in Neon SQL Editor in one go (Run all), not just the SELECTs.
-- If you get "relation abstracts_rels does not exist", run create_abstracts_rels_table.sql first.
-- =====================================================

-- Step 0: Check table exists and what's currently there for abstract 50
SELECT 'Current rows for abstract 50 in abstracts_rels:' AS step;
SELECT id, parent_id, path, users_id, "order"
FROM abstracts_rels
WHERE parent_id = 50;

-- Step 1: Remove ALL relationship rows for abstract 50 (clean slate)
DELETE FROM abstracts_rels
WHERE parent_id = 50;

-- Step 2: Insert the assignment: abstract 50 -> reviewer (user) 3
INSERT INTO abstracts_rels (parent_id, path, users_id, "order")
VALUES (50, 'assignedReviewers', 3, 1);

-- Step 3: Verify (should return 1 row)
SELECT 'After fix (should show 1 row):' AS step;
SELECT ar.id, ar.parent_id, ar.path, ar.users_id, u.email
FROM abstracts_rels ar
LEFT JOIN users u ON u.id = ar.users_id
WHERE ar.parent_id = 50;
