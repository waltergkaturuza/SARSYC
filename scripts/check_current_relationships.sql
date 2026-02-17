-- Check current state of all abstracts_rels relationships
-- Run this to see what relationships currently exist

SELECT 
  ar.parent_id AS abstract_id,
  a.title,
  a.status,
  ar.users_id,
  u.email,
  u.role,
  ar."order",
  CASE 
    WHEN ar.users_id = 0 THEN '❌ Invalid: users_id = 0'
    WHEN u.id IS NULL THEN '❌ Invalid: User does not exist'
    WHEN u.role NOT IN ('reviewer', 'admin', 'editor') THEN '❌ Invalid: Wrong role'
    ELSE '✅ Valid'
  END AS status
FROM abstracts_rels ar
LEFT JOIN abstracts a ON a.id = ar.parent_id
LEFT JOIN users u ON u.id = ar.users_id
WHERE ar.path = 'assignedReviewers'
ORDER BY ar.parent_id, ar."order";
