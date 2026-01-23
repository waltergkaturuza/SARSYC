-- Add new resource type enum values
-- Run this SQL directly on your PostgreSQL database

ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'abstract';
ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'concept-note';
ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'research-report';
ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'symposium-report';
ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'communique';
ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'declaration';
ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'template';

-- Verify the changes
SELECT unnest(enum_range(NULL::enum_resources_type)) AS resource_type;
