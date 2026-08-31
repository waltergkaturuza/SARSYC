import type { Payload } from 'payload'

let patchedThisInstance = false
let galleryPatchedThisInstance = false

/**
 * Idempotent DDL for the conferences collection (previous + current editions).
 */
export async function ensureConferencesSchema(payload: Payload): Promise<void> {
  const db = payload.db as { drizzle: { execute: (sql: string) => Promise<unknown> } }

  if (!patchedThisInstance) {
    await db.drizzle.execute(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_conferences_status') THEN
          CREATE TYPE "enum_conferences_status" AS ENUM ('draft', 'published', 'archived');
        END IF;
      END
      $$;
    `)

    await db.drizzle.execute(`
      CREATE TABLE IF NOT EXISTS "conferences" (
        "id" serial PRIMARY KEY,
        "title" varchar NOT NULL,
        "slug" varchar NOT NULL,
        "year" numeric NOT NULL,
        "location" varchar NOT NULL,
        "theme" varchar,
        "summary" varchar NOT NULL,
        "participants" varchar,
        "highlights" varchar,
        "content" varchar,
        "start_date" timestamptz,
        "end_date" timestamptz,
        "is_current" boolean DEFAULT false,
        "current_path" varchar,
        "status" "enum_conferences_status" NOT NULL DEFAULT 'published',
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
    `)

    await db.drizzle.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS "conferences_slug_idx" ON "conferences" ("slug");
    `)
    await db.drizzle.execute(`
      CREATE INDEX IF NOT EXISTS "conferences_updated_at_idx" ON "conferences" ("updated_at");
    `)
    await db.drizzle.execute(`
      CREATE INDEX IF NOT EXISTS "conferences_created_at_idx" ON "conferences" ("created_at");
    `)

    await db.drizzle.execute(`
      CREATE TABLE IF NOT EXISTS "conferences_key_outcomes" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "outcome" varchar
      );
    `)
    await db.drizzle.execute(`
      CREATE INDEX IF NOT EXISTS "conferences_key_outcomes_order_idx"
        ON "conferences_key_outcomes" ("_order");
    `)
    await db.drizzle.execute(`
      CREATE INDEX IF NOT EXISTS "conferences_key_outcomes_parent_id_idx"
        ON "conferences_key_outcomes" ("_parent_id");
    `)

    await db.drizzle.execute(`
      CREATE TABLE IF NOT EXISTS "conferences_related_links" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "label" varchar,
        "url" varchar
      );
    `)
    await db.drizzle.execute(`
      CREATE INDEX IF NOT EXISTS "conferences_related_links_order_idx"
        ON "conferences_related_links" ("_order");
    `)
    await db.drizzle.execute(`
      CREATE INDEX IF NOT EXISTS "conferences_related_links_parent_id_idx"
        ON "conferences_related_links" ("_parent_id");
    `)

    patchedThisInstance = true
  }

  if (!galleryPatchedThisInstance) {
    await db.drizzle.execute(`
      CREATE TABLE IF NOT EXISTS "conferences_gallery" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "caption" varchar,
        "image_id" integer
      );
    `)
    await db.drizzle.execute(`
      CREATE INDEX IF NOT EXISTS "conferences_gallery_order_idx"
        ON "conferences_gallery" ("_order");
    `)
    await db.drizzle.execute(`
      CREATE INDEX IF NOT EXISTS "conferences_gallery_parent_id_idx"
        ON "conferences_gallery" ("_parent_id");
    `)
    await db.drizzle.execute(`
      CREATE INDEX IF NOT EXISTS "conferences_gallery_image_idx"
        ON "conferences_gallery" ("image_id");
    `)
    galleryPatchedThisInstance = true
  }
}
