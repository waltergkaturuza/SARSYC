-- =====================================================
-- Fix abstract 50: remove invalid "0" relationships and assign reviewer 3
-- Run this in Neon SQL Editor: https://console.neon.tech → your project → SQL Editor
--
-- Reviewer 3 = waltergkaturuza@gmail.com (id = 3 in users table)
-- =====================================================

-- 1) Optional: confirm abstract id 50 and user id 3 exist
-- SELECT id, title FROM abstracts WHERE id = 50;
-- SELECT id, email FROM users WHERE id = 3;

-- 2) Remove invalid relationships for abstract 50 (any row with users_id = 0 or NULL)
DELETE FROM abstracts_rels
WHERE parent_id = 50
  AND path = 'assignedReviewers'
  AND (users_id = 0 OR users_id IS NULL);

-- 3) Remove any other invalid "0" relationships for abstract 50 (all paths)
DELETE FROM abstracts_rels
WHERE parent_id = 50
  AND (users_id = 0 OR users_id IS NULL);

-- 4) If reviewer 3 is not already linked, add the assignment
--    (order = 1; use next order if you add more reviewers later)
INSERT INTO abstracts_rels (parent_id, path, users_id, "order")
SELECT 50, 'assignedReviewers', 3, 1
WHERE NOT EXISTS (
  SELECT 1 FROM abstracts_rels
  WHERE parent_id = 50 AND path = 'assignedReviewers' AND users_id = 3
);

-- 5) Verify result: should show one row for abstract 50 → user 3
-- SELECT ar.id, ar.parent_id, ar.path, ar.users_id, ar."order", u.email
-- FROM abstracts_rels ar
-- LEFT JOIN users u ON u.id = ar.users_id
-- WHERE ar.parent_id = 50 AND ar.path = 'assignedReviewers';
