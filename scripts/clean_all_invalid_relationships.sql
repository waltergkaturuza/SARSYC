-- =====================================================
-- Clean ALL invalid relationships (users_id = 0) from abstracts_rels
-- Run this in Neon SQL Editor to remove all "0" rows
-- =====================================================

-- 1) Show what will be deleted (preview)
SELECT 'Preview: Rows that will be deleted' AS step;
SELECT 
  ar.id,
  ar.parent_id AS abstract_id,
  ar.path,
  ar.users_id,
  ar."order",
  a.title AS abstract_title
FROM abstracts_rels ar
LEFT JOIN abstracts a ON a.id = ar.parent_id
WHERE ar.path = 'assignedReviewers'
  AND ar.users_id = 0;

-- 2) Count how many will be deleted
SELECT 'Count of rows to delete:' AS step;
SELECT COUNT(*) as rows_to_delete
FROM abstracts_rels
WHERE path = 'assignedReviewers'
  AND users_id = 0;

-- 3) DELETE all rows with users_id = 0
DELETE FROM abstracts_rels
WHERE path = 'assignedReviewers'
  AND users_id = 0;

-- 4) Verify deletion (should return 0 rows)
SELECT 'Verification: Should show 0 rows' AS step;
SELECT COUNT(*) as remaining_zero_rows
FROM abstracts_rels
WHERE path = 'assignedReviewers'
  AND users_id = 0;

-- 5) Show remaining valid relationships
SELECT 'Remaining valid relationships:' AS step;
SELECT 
  ar.parent_id AS abstract_id,
  a.title,
  COUNT(*) as reviewer_count,
  STRING_AGG(u.email, ', ' ORDER BY u.email) as reviewer_emails
FROM abstracts_rels ar
JOIN abstracts a ON a.id = ar.parent_id
LEFT JOIN users u ON u.id = ar.users_id
WHERE ar.path = 'assignedReviewers'
GROUP BY ar.parent_id, a.title
ORDER BY ar.parent_id;
