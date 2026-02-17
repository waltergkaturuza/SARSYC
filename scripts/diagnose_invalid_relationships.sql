-- =====================================================
-- Diagnose: How is user ID "0" getting into abstracts_rels?
-- Run this in Neon SQL Editor to investigate the "0" issue
-- =====================================================

-- 1) Find all abstracts_rels rows with users_id = 0
SELECT 'Rows with users_id = 0:' AS check_type;
SELECT 
  ar.id,
  ar.parent_id AS abstract_id,
  ar.path,
  ar.users_id,
  ar."order",
  a.title AS abstract_title,
  a.status AS abstract_status
FROM abstracts_rels ar
LEFT JOIN abstracts a ON a.id = ar.parent_id
WHERE ar.path = 'assignedReviewers'
  AND ar.users_id = 0
ORDER BY ar.parent_id, ar."order";

-- 2) Find abstracts that have BOTH user 0 AND user 3 (or other valid users)
SELECT 'Abstracts with BOTH invalid (0) and valid reviewers:' AS check_type;
SELECT 
  ar.parent_id AS abstract_id,
  a.title,
  a.status,
  COUNT(DISTINCT CASE WHEN ar.users_id = 0 THEN ar.users_id END) as has_zero,
  COUNT(DISTINCT CASE WHEN ar.users_id != 0 THEN ar.users_id END) as has_valid,
  STRING_AGG(DISTINCT ar.users_id::text, ', ' ORDER BY ar.users_id::text) as all_user_ids
FROM abstracts_rels ar
JOIN abstracts a ON a.id = ar.parent_id
WHERE ar.path = 'assignedReviewers'
GROUP BY ar.parent_id, a.title, a.status
HAVING COUNT(DISTINCT CASE WHEN ar.users_id = 0 THEN ar.users_id END) > 0
ORDER BY ar.parent_id;

-- 3) Check abstract 50 specifically (the one we were fixing)
SELECT 'Abstract 50 relationships:' AS check_type;
SELECT 
  ar.id,
  ar.parent_id,
  ar.path,
  ar.users_id,
  ar."order",
  u.email,
  u.role,
  CASE 
    WHEN ar.users_id = 0 THEN '❌ Invalid: users_id = 0'
    WHEN u.id IS NULL THEN '❌ Invalid: User does not exist'
    WHEN u.role NOT IN ('reviewer', 'admin', 'editor') THEN '❌ Invalid: Wrong role'
    ELSE '✅ Valid'
  END AS status
FROM abstracts_rels ar
LEFT JOIN users u ON u.id = ar.users_id
WHERE ar.parent_id = 50 
  AND ar.path = 'assignedReviewers'
ORDER BY ar."order";

-- 4) Check if there are any NULL users_id (another invalid case)
SELECT 'Rows with NULL users_id:' AS check_type;
SELECT 
  ar.id,
  ar.parent_id AS abstract_id,
  ar.path,
  ar.users_id,
  ar."order"
FROM abstracts_rels ar
WHERE ar.path = 'assignedReviewers'
  AND ar.users_id IS NULL;

-- 5) Summary: Count of invalid vs valid relationships
SELECT 'Summary of invalid relationships:' AS check_type;
SELECT 
  CASE 
    WHEN ar.users_id = 0 THEN 'users_id = 0'
    WHEN ar.users_id IS NULL THEN 'users_id IS NULL'
    WHEN u.id IS NULL THEN 'User does not exist'
    WHEN u.role NOT IN ('reviewer', 'admin', 'editor') THEN 'Wrong role: ' || u.role
    ELSE 'Valid'
  END AS issue_type,
  COUNT(*) as count
FROM abstracts_rels ar
LEFT JOIN users u ON u.id = ar.users_id
WHERE ar.path = 'assignedReviewers'
GROUP BY 
  CASE 
    WHEN ar.users_id = 0 THEN 'users_id = 0'
    WHEN ar.users_id IS NULL THEN 'users_id IS NULL'
    WHEN u.id IS NULL THEN 'User does not exist'
    WHEN u.role NOT IN ('reviewer', 'admin', 'editor') THEN 'Wrong role: ' || u.role
    ELSE 'Valid'
  END
ORDER BY count DESC;
