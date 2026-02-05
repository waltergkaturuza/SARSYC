-- =====================================================
-- Add 'reviewer' and 'volunteer' to users role enum
-- Run in Neon if updating a user to Reviewer fails with
--   invalid input value for enum enum_users_role: "reviewer"
-- =====================================================

ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'reviewer';
ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'volunteer';
