-- Extract primary-author emails for abstracts missing age, gender, and/or institution.
-- Postgres (Payload `abstracts` table). Columns from migration 20260312_000001.
--
-- Run (examples):
--   psql "$DATABASE_URL" -f scripts/extract_abstracts_missing_demographics.sql
--   psql -h HOST -U USER -d DBNAME -f scripts/extract_abstracts_missing_demographics.sql

-- 1) Full row (for outreach / admin review): who is missing what
SELECT
  a.id,
  a.submission_id,
  a.primary_author_email AS email,
  trim(concat_ws(' ', a.primary_author_first_name, a.primary_author_last_name)) AS author_name,
  a.title,
  a.status,
  a.primary_author_age AS age,
  a.primary_author_gender AS gender,
  a.primary_author_institution AS institution,
  (a.primary_author_age IS NULL) AS missing_age,
  (NULLIF(trim(coalesce(a.primary_author_gender, '')), '') IS NULL) AS missing_gender,
  (NULLIF(trim(coalesce(a.primary_author_institution, '')), '') IS NULL) AS missing_institution
FROM abstracts AS a
WHERE
  a.primary_author_age IS NULL
  OR NULLIF(trim(coalesce(a.primary_author_gender, '')), '') IS NULL
  OR NULLIF(trim(coalesce(a.primary_author_institution, '')), '') IS NULL
ORDER BY a.id;

-- 2) Emails only (one per row, distinct)
-- Uncomment to use instead of query (1):

-- SELECT DISTINCT trim(lower(a.primary_author_email)) AS email
-- FROM abstracts AS a
-- WHERE
--   a.primary_author_age IS NULL
--   OR NULLIF(trim(coalesce(a.primary_author_gender, '')), '') IS NULL
--   OR NULLIF(trim(coalesce(a.primary_author_institution, '')), '') IS NULL
-- ORDER BY 1;
