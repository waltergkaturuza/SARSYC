import type { Payload } from 'payload'
import { ensureLockedDocsRelsColumns } from '@/lib/ensureLockedDocsRelsColumns'

let patchedThisInstance = false

/**
 * Idempotent DDL for orathon-countries (registration links + flyers).
 */
export async function ensureOrathonCountriesSchema(payload: Payload): Promise<void> {
  if (patchedThisInstance) return

  const db = payload.db as { drizzle: { execute: (sql: string) => Promise<unknown> } }

  await db.drizzle.execute(`
    CREATE TABLE IF NOT EXISTS "orathon_countries" (
      "id" serial PRIMARY KEY,
      "country" varchar NOT NULL,
      "title" varchar NOT NULL,
      "description" varchar,
      "registration_url" varchar NOT NULL,
      "flyer_id" integer,
      "display_order" numeric DEFAULT 0,
      "active" boolean DEFAULT true,
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "created_at" timestamptz NOT NULL DEFAULT now()
    );
  `)

  await db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "orathon_countries_updated_at_idx"
      ON "orathon_countries" ("updated_at");
  `)
  await db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "orathon_countries_created_at_idx"
      ON "orathon_countries" ("created_at");
  `)
  await db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "orathon_countries_country_idx"
      ON "orathon_countries" ("country");
  `)

  // Payload document-locking joins require this FK column
  await ensureLockedDocsRelsColumns(payload)

  patchedThisInstance = true
}
