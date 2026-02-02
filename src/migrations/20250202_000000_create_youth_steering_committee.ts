import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Migration to create Youth Steering Committee collection table
 * This ensures the table exists in production before the collection is used
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Create the main youth_steering_committee table
    CREATE TABLE IF NOT EXISTS "youth_steering_committee" (
      "id" serial PRIMARY KEY,
      "name" text NOT NULL,
      "role" text NOT NULL,
      "organization" text NOT NULL,
      "country" text NOT NULL,
      "bio" jsonb NOT NULL,
      "email" text,
      "photo" integer,
      "featured" boolean DEFAULT false,
      "order" integer DEFAULT 0,
      "social_media" jsonb DEFAULT '{}'::jsonb,
      "created_at" timestamp(3) DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) DEFAULT now() NOT NULL
    );

    -- Create index on photo relationship
    CREATE INDEX IF NOT EXISTS "youth_steering_committee_photo_idx" ON "youth_steering_committee" ("photo");

    -- Create index on featured for filtering
    CREATE INDEX IF NOT EXISTS "youth_steering_committee_featured_idx" ON "youth_steering_committee" ("featured");

    -- Create index on order for sorting
    CREATE INDEX IF NOT EXISTS "youth_steering_committee_order_idx" ON "youth_steering_committee" ("order");

    -- Create index on country for filtering
    CREATE INDEX IF NOT EXISTS "youth_steering_committee_country_idx" ON "youth_steering_committee" ("country");

    -- Create index on created_at for sorting
    CREATE INDEX IF NOT EXISTS "youth_steering_committee_created_at_idx" ON "youth_steering_committee" ("created_at");

    -- Add foreign key constraint for photo relationship to media table
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'youth_steering_committee_photo_fkey'
      ) THEN
        ALTER TABLE "youth_steering_committee"
        ADD CONSTRAINT "youth_steering_committee_photo_fkey"
        FOREIGN KEY ("photo") REFERENCES "media"("id") ON DELETE SET NULL;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Drop the table (WARNING: This will delete all data!)
    DROP TABLE IF EXISTS "youth_steering_committee" CASCADE;
  `)
}
