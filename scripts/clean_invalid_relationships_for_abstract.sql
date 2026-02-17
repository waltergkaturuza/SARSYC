-- =====================================================
-- Clean invalid relationships (users_id = 0) for a specific abstract
-- Run this in Neon SQL Editor
-- 
-- REPLACE 50 with the actual abstract ID you want to clean
-- =====================================================

-- Replace 50 with your abstract ID
DELETE FROM abstracts_rels
WHERE parent_id = 50  -- ⚠️ CHANGE THIS to your abstract ID
  AND path = 'assignedReviewers'
  AND (users_id = 0 OR users_id IS NULL);

-- Verify deletion
SELECT 
  ar.parent_id,
  ar.path,
  ar.users_id,
  u.email,
  CASE 
    WHEN ar.users_id = 0 THEN '❌ Invalid: users_id = 0'
    WHEN u.id IS NULL THEN '❌ Invalid: User does not exist'
    ELSE '✅ Valid'
  END AS status
FROM abstracts_rels ar
LEFT JOIN users u ON u.id = ar.users_id
WHERE ar.parent_id = 50  -- ⚠️ CHANGE THIS to your abstract ID
  AND ar.path = 'assignedReviewers';
