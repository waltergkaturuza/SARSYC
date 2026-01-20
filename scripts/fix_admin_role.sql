-- Fix admin@sarsyc.org role
-- Run this in Neon SQL Editor: https://console.neon.tech

-- First, check the current role
SELECT id, email, role 
FROM users 
WHERE email = 'admin@sarsyc.org';

-- Update the role to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@sarsyc.org';

-- Verify the update
SELECT id, email, role 
FROM users 
WHERE email = 'admin@sarsyc.org';

-- Optional: Show all admin users
SELECT id, email, role, "createdAt", "updatedAt"
FROM users 
WHERE role = 'admin'
ORDER BY "createdAt" DESC;
