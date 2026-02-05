# Fix: relation "abstracts_rels" does not exist

## Cause
The Abstracts collection has relationship fields (`assignedReviewers`, `user`) that store links in a join table. That table was never created in the database.

## Fix
Run the SQL script in your Neon SQL Editor (same project as your app):

1. Open [Neon Console](https://console.neon.tech) → your project → **SQL Editor**.
2. Paste the contents of `create_abstracts_rels_table.sql`.
3. Run the script.

After it runs, the admin dashboard (and abstract list/detail pages) should load without the "abstracts_rels does not exist" error.

## Run only once
If you run the script again, `CREATE TABLE IF NOT EXISTS` is safe. The `ALTER TABLE ... ADD CONSTRAINT` lines may fail with "constraint already exists"; that is fine and can be ignored.
