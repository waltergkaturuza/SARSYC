import type { Payload } from 'payload'

let patchedThisInstance = false

const TRACK_ENUM_VALUES = [
  'education-rights',
  'hiv-aids',
  'ncd-prevention',
  'digital-health',
  'mental-health',
]

const TYPE_ENUM_VALUES = [
  'break',
  'post-conference',
  'orathon',
  'launch-event',
  'concluding-presentation',
  'forum-reflection',
  'award-ceremony',
  'welcome-remarks',
  'introductions',
  'presentation',
  'round-table',
  'music-dance',
  'lunch',
  'dinner',
]

const DAY_ENUM_VALUES = ['day-1', 'day-2', 'day-3', 'day-4']

function addEnumValueSql(enumName: string, value: string): string {
  return `
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = '${enumName}')
        AND NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = '${value}'
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = '${enumName}')
        )
      THEN
        ALTER TYPE "${enumName}" ADD VALUE '${value}';
      END IF;
    END
    $$;
  `
}

/**
 * Idempotent DDL for sessions columns/enum values added after initial deploy.
 * Runs once per serverless instance so queries don't fail on missing columns.
 */
export async function ensureSessionsLatestColumns(payload: Payload): Promise<void> {
  if (patchedThisInstance) return

  const db = payload.db as unknown as { drizzle: { execute: (sql: string) => Promise<unknown> } }

  // Day select enum + column (added after the sessions table was first created).
  await db.drizzle.execute(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_sessions_day') THEN
        CREATE TYPE "enum_sessions_day" AS ENUM (${DAY_ENUM_VALUES.map((v) => `'${v}'`).join(', ')});
      END IF;
    END
    $$;
  `)

  for (const value of DAY_ENUM_VALUES) {
    await db.drizzle.execute(addEnumValueSql('enum_sessions_day', value))
  }

  await db.drizzle.execute(
    `ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "day" "enum_sessions_day" DEFAULT 'day-1'`,
  )

  // Guest speaker names typed as free text (people not in the speakers collection).
  await db.drizzle.execute(
    `ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "speaker_names" varchar`,
  )

  // Relationship to youth steering committee members (added after the
  // sessions_rels table was first created).
  await db.drizzle.execute(
    `ALTER TABLE "sessions_rels" ADD COLUMN IF NOT EXISTS "youth_steering_committee_id" integer`,
  )
  await db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "sessions_rels_youth_steering_committee_id_idx"
      ON "sessions_rels" ("youth_steering_committee_id");
  `)

  // Newer track taxonomy (aligned with the five official conference tracks).
  for (const value of TRACK_ENUM_VALUES) {
    await db.drizzle.execute(addEnumValueSql('enum_sessions_track', value))
  }

  // Newer session types.
  for (const value of TYPE_ENUM_VALUES) {
    await db.drizzle.execute(addEnumValueSql('enum_sessions_type', value))
  }

  // Optional Youth Steering Committee member as session moderator.
  await db.drizzle.execute(
    `ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "committee_moderator_id" integer`,
  )
  await db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "sessions_committee_moderator_idx"
      ON "sessions" ("committee_moderator_id");
  `)

  // Publish visibility (draft / published / archived).
  await db.drizzle.execute(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_sessions_status') THEN
        CREATE TYPE "enum_sessions_status" AS ENUM ('draft', 'published', 'archived');
      END IF;
    END
    $$;
  `)
  for (const value of ['draft', 'published', 'archived']) {
    await db.drizzle.execute(addEnumValueSql('enum_sessions_status', value))
  }
  await db.drizzle.execute(
    `ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "status" "enum_sessions_status" DEFAULT 'published'`,
  )
  await db.drizzle.execute(
    `UPDATE "sessions" SET "status" = 'published' WHERE "status" IS NULL`,
  )

  patchedThisInstance = true
}
