import type { Payload } from 'payload'

let patchedThisInstance = false

/**
 * Align youth_steering_committee columns with what Payload/Drizzle expects.
 * The original create migration used "photo" and a jsonb "social_media" blob;
 * Payload upload/group fields map to photo_id and social_media_*.
 */
export async function ensureYouthSteeringCommitteeLatestColumns(payload: Payload): Promise<void> {
  if (patchedThisInstance) return

  const db = payload.db as unknown as { drizzle: { execute: (sql: string) => Promise<unknown> } }

  // Rename legacy "photo" → "photo_id" (Payload upload FK naming).
  await db.drizzle.execute(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'youth_steering_committee'
          AND column_name = 'photo'
      ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'youth_steering_committee'
          AND column_name = 'photo_id'
      ) THEN
        ALTER TABLE "youth_steering_committee"
          DROP CONSTRAINT IF EXISTS "youth_steering_committee_photo_fkey";
        ALTER TABLE "youth_steering_committee"
          RENAME COLUMN "photo" TO "photo_id";
        IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'youth_steering_committee_photo_idx') THEN
          ALTER INDEX "youth_steering_committee_photo_idx"
            RENAME TO "youth_steering_committee_photo_id_idx";
        END IF;
        ALTER TABLE "youth_steering_committee"
          ADD CONSTRAINT "youth_steering_committee_photo_id_media_id_fk"
          FOREIGN KEY ("photo_id") REFERENCES "media"("id") ON DELETE SET NULL;
      END IF;
    END
    $$;
  `)

  await db.drizzle.execute(
    `ALTER TABLE "youth_steering_committee" ADD COLUMN IF NOT EXISTS "photo_id" integer`,
  )

  await db.drizzle.execute(
    `ALTER TABLE "youth_steering_committee" ADD COLUMN IF NOT EXISTS "social_media_twitter" varchar`,
  )
  await db.drizzle.execute(
    `ALTER TABLE "youth_steering_committee" ADD COLUMN IF NOT EXISTS "social_media_linkedin" varchar`,
  )
  await db.drizzle.execute(
    `ALTER TABLE "youth_steering_committee" ADD COLUMN IF NOT EXISTS "social_media_website" varchar`,
  )

  // Best-effort copy from legacy jsonb social_media blob when present.
  await db.drizzle.execute(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'youth_steering_committee'
          AND column_name = 'social_media'
      ) THEN
        UPDATE "youth_steering_committee"
        SET
          "social_media_twitter" = COALESCE(
            "social_media_twitter",
            NULLIF("social_media"->>'twitter', '')
          ),
          "social_media_linkedin" = COALESCE(
            "social_media_linkedin",
            NULLIF("social_media"->>'linkedin', '')
          ),
          "social_media_website" = COALESCE(
            "social_media_website",
            NULLIF("social_media"->>'website', '')
          )
        WHERE "social_media" IS NOT NULL;
      END IF;
    END
    $$;
  `)

  patchedThisInstance = true
}
