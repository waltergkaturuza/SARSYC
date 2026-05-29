import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    CREATE TABLE IF NOT EXISTS "stanbic_payment_events" (
      "id" serial PRIMARY KEY,
      "event" varchar NOT NULL,
      "registration_ref" varchar,
      "order_reference" varchar,
      "email" varchar,
      "verification_approved" boolean DEFAULT false,
      "db_payment_status_updated" boolean DEFAULT false,
      "payment_state" varchar,
      "payment_status" varchar,
      "verification_error" varchar,
      "payload" jsonb,
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "created_at" timestamptz NOT NULL DEFAULT now()
    );
  `)
  await payload.db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "stanbic_payment_events_registration_ref_idx"
      ON "stanbic_payment_events" ("registration_ref");
  `)
  await payload.db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "stanbic_payment_events_created_at_idx"
      ON "stanbic_payment_events" ("created_at" DESC);
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`DROP TABLE IF EXISTS "stanbic_payment_events";`)
}
