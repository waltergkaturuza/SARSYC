import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    CREATE TABLE IF NOT EXISTS "audit_logs" (
      "id" serial PRIMARY KEY NOT NULL,
      "action" varchar NOT NULL,
      "collection" varchar NOT NULL,
      "document_id" varchar NOT NULL,
      "user_id" integer,
      "user_email" varchar,
      "user_role" varchar,
      "changes" jsonb,
      "before" jsonb,
      "after" jsonb,
      "ip_address" varchar,
      "user_agent" text,
      "description" text,
      "metadata" jsonb,
      "created_at" timestamp(3) DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) DEFAULT now() NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "audit_logs_collection_idx" ON "audit_logs"("collection");
    CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs"("action");
    CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "audit_logs"("user_id");
    CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs"("created_at");
    CREATE INDEX IF NOT EXISTS "audit_logs_document_id_idx" ON "audit_logs"("document_id");

    ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  `)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    DROP TABLE IF EXISTS "audit_logs";
  `)
}

