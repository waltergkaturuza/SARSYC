-- Check if user ID 3 has the reviewer role
-- Run this in Neon SQL Editor to diagnose the "invalid relationships: 3 0" error

SELECT 
  id,
  email,
  role,
  first_name,
  last_name,
  CASE 
    WHEN role IN ('reviewer', 'admin', 'editor') THEN '✅ Valid reviewer role'
    ELSE '❌ Invalid role for reviewer assignment'
  END AS reviewer_status
FROM users
WHERE id = 3;

-- Also check what roles are valid for reviewer assignment
SELECT DISTINCT role, COUNT(*) as user_count
FROM users
WHERE role IN ('reviewer', 'admin', 'editor')
GROUP BY role;
