-- Distinct primary-author emails: abstracts missing age and/or gender and/or institution.
-- Postgres. Run: psql "$DATABASE_URL" -f scripts/extract_abstracts_missing_demographics_emails_only.sql

SELECT DISTINCT trim(lower(primary_author_email)) AS email
FROM abstracts
WHERE
  primary_author_age IS NULL
  OR NULLIF(trim(coalesce(primary_author_gender, '')), '') IS NULL
  OR NULLIF(trim(coalesce(primary_author_institution, '')), '') IS NULL
ORDER BY 1;
