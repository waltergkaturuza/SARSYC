import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    CREATE TABLE IF NOT EXISTS "page_views" (
      "id" serial PRIMARY KEY NOT NULL,
      "path" varchar NOT NULL,
      "referrer" varchar,
      "session_id" varchar NOT NULL,
      "created_at" timestamp(3) DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) DEFAULT now() NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "page_views_path_idx" ON "page_views"("path");
    CREATE INDEX IF NOT EXISTS "page_views_session_id_idx" ON "page_views"("session_id");
    CREATE INDEX IF NOT EXISTS "page_views_created_at_idx" ON "page_views"("created_at");

    CREATE TABLE IF NOT EXISTS "site_events" (
      "id" serial PRIMARY KEY NOT NULL,
      "event_type" varchar NOT NULL,
      "path" varchar,
      "session_id" varchar,
      "metadata" jsonb,
      "created_at" timestamp(3) DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) DEFAULT now() NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "site_events_event_type_idx" ON "site_events"("event_type");
    CREATE INDEX IF NOT EXISTS "site_events_created_at_idx" ON "site_events"("created_at");
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    DROP TABLE IF EXISTS "page_views";
    DROP TABLE IF EXISTS "site_events";
  `)
}
