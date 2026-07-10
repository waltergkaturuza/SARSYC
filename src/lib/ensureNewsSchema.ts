import type { Payload } from 'payload'

let patchedThisInstance = false

/**
 * Idempotent DDL for news fields added after initial deploy.
 * Runs once per serverless instance so queries don't fail on missing columns/tables.
 */
export async function ensureNewsLatestColumns(payload: Payload): Promise<void> {
  if (patchedThisInstance) return

  const db = payload.db as { drizzle: { execute: (sql: string) => Promise<unknown> } }

  await db.drizzle.execute(
    `ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "download_resource_label" varchar`,
  )
  await db.drizzle.execute(
    `ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "download_resource_url" varchar`,
  )

  await db.drizzle.execute(`
    CREATE TABLE IF NOT EXISTS "news_related_links" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar,
      "url" varchar
    );
  `)

  await db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "news_related_links_order_idx"
      ON "news_related_links" ("_order");
  `)
  await db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "news_related_links_parent_id_idx"
      ON "news_related_links" ("_parent_id");
  `)

  await db.drizzle.execute(`
    CREATE TABLE IF NOT EXISTS "news_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "users_id" integer
    );
  `)

  await db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "news_rels_order_idx" ON "news_rels" ("order");
  `)
  await db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "news_rels_parent_idx" ON "news_rels" ("parent_id");
  `)
  await db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "news_rels_path_idx" ON "news_rels" ("path");
  `)
  await db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "news_rels_users_id_idx" ON "news_rels" ("users_id");
  `)

  patchedThisInstance = true
}
