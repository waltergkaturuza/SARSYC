import type { Payload } from 'payload'

let patchedThisInstance = false

/**
 * Idempotent DDL for speakers columns added after initial deploy.
 * Runs once per serverless instance so queries don't fail on missing columns.
 */
export async function ensureSpeakersLatestColumns(payload: Payload): Promise<void> {
  if (patchedThisInstance) return

  // Add abstract_title column if missing
  await (payload.db as any).drizzle.execute(
    `ALTER TABLE "speakers" ADD COLUMN IF NOT EXISTS "abstract_title" varchar`,
  )

  // Add abstract-presenter to the speakers type enum if missing.
  // ALTER TYPE ... ADD VALUE cannot run inside a transaction, so we check first.
  await (payload.db as any).drizzle.execute(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'abstract-presenter'
          AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'enum_speakers_type'
          )
      ) THEN
        ALTER TYPE "enum_speakers_type" ADD VALUE 'abstract-presenter';
      END IF;
    END
    $$;
  `)

  // Add abstract-reviewer to the speakers type enum if missing.
  await (payload.db as any).drizzle.execute(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'abstract-reviewer'
          AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'enum_speakers_type'
          )
      ) THEN
        ALTER TYPE "enum_speakers_type" ADD VALUE 'abstract-reviewer';
      END IF;
    END
    $$;
  `)

  // Backfill thumbnail_u_r_l for media records that have a Blob URL only in "url".
  // Display helpers prefer a Blob thumbnailURL, so this repairs photos that broke
  // when Payload regenerated "url" as a local /api/media/file path on read.
  await (payload.db as any).drizzle.execute(`
    UPDATE "media"
    SET "thumbnail_u_r_l" = "url"
    WHERE ("thumbnail_u_r_l" IS NULL OR "thumbnail_u_r_l" = '')
      AND "url" LIKE '%blob.vercel-storage.com%'
  `)

  patchedThisInstance = true
}
