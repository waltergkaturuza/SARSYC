-- =====================================================
-- Create abstracts_rels table for Payload CMS
-- Required for Abstracts collection relationship fields:
--   assignedReviewers (hasMany -> users), user (relationTo -> users)
-- Run this in Neon SQL Editor if the admin dashboard fails with:
--   relation "abstracts_rels" does not exist
-- =====================================================

-- Create abstracts_rels (same pattern as speakers_rels, sessions_rels)
CREATE TABLE IF NOT EXISTS "abstracts_rels" (
  "id" serial PRIMARY KEY NOT NULL,
  "order" integer,
  "parent_id" integer NOT NULL,
  "path" varchar NOT NULL,
  "users_id" integer
);

-- Foreign keys
ALTER TABLE "abstracts_rels"
  ADD CONSTRAINT "abstracts_rels_parent_fk"
  FOREIGN KEY ("parent_id") REFERENCES "abstracts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "abstracts_rels"
  ADD CONSTRAINT "abstracts_rels_users_fk"
  FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Indexes (match Payload query pattern)
CREATE INDEX IF NOT EXISTS "abstracts_rels_order_idx"
  ON "abstracts_rels" USING btree ("order");
CREATE INDEX IF NOT EXISTS "abstracts_rels_parent_idx"
  ON "abstracts_rels" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "abstracts_rels_path_idx"
  ON "abstracts_rels" USING btree ("path");
CREATE INDEX IF NOT EXISTS "abstracts_rels_users_id_idx"
  ON "abstracts_rels" USING btree ("users_id");

-- Verify
SELECT 'abstracts_rels created' AS status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'abstracts_rels');
