import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Add new role values to enum_users_role
    ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'speaker';
    ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'presenter';
    
    -- Add email column to speakers table
    ALTER TABLE "speakers" 
      ADD COLUMN IF NOT EXISTS "email" varchar;
    
    -- Make email required (set default for existing rows first, then make NOT NULL)
    UPDATE "speakers" SET "email" = '' WHERE "email" IS NULL;
    ALTER TABLE "speakers" 
      ALTER COLUMN "email" SET NOT NULL;
    
    -- Add user relationship column to speakers table
    ALTER TABLE "speakers" 
      ADD COLUMN IF NOT EXISTS "user_id" integer;
    
    -- Add foreign key constraint for speakers.user_id -> users.id
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'speakers_user_id_fkey'
      ) THEN
        ALTER TABLE "speakers" 
          ADD CONSTRAINT "speakers_user_id_fkey" 
          FOREIGN KEY ("user_id") 
          REFERENCES "public"."users"("id") 
          ON DELETE SET NULL 
          ON UPDATE NO ACTION;
      END IF;
    END $$;
    
    -- Add speaker relationship column to users table
    ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "speaker_id" integer;
    
    -- Add foreign key constraint for users.speaker_id -> speakers.id
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_speaker_id_fkey'
      ) THEN
        ALTER TABLE "users" 
          ADD CONSTRAINT "users_speaker_id_fkey" 
          FOREIGN KEY ("speaker_id") 
          REFERENCES "public"."speakers"("id") 
          ON DELETE SET NULL 
          ON UPDATE NO ACTION;
      END IF;
    END $$;
    
    -- Add abstract relationship column to users table
    ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "abstract_id" integer;
    
    -- Add foreign key constraint for users.abstract_id -> abstracts.id
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_abstract_id_fkey'
      ) THEN
        ALTER TABLE "users" 
          ADD CONSTRAINT "users_abstract_id_fkey" 
          FOREIGN KEY ("abstract_id") 
          REFERENCES "public"."abstracts"("id") 
          ON DELETE SET NULL 
          ON UPDATE NO ACTION;
      END IF;
    END $$;
    
    -- Add user relationship column to abstracts table
    ALTER TABLE "abstracts" 
      ADD COLUMN IF NOT EXISTS "user_id" integer;
    
    -- Add foreign key constraint for abstracts.user_id -> users.id
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'abstracts_user_id_fkey'
      ) THEN
        ALTER TABLE "abstracts" 
          ADD CONSTRAINT "abstracts_user_id_fkey" 
          FOREIGN KEY ("user_id") 
          REFERENCES "public"."users"("id") 
          ON DELETE SET NULL 
          ON UPDATE NO ACTION;
      END IF;
    END $$;
    
    -- Create indexes for better query performance
    CREATE INDEX IF NOT EXISTS "speakers_email_idx" 
      ON "speakers" USING btree ("email");
    CREATE INDEX IF NOT EXISTS "speakers_user_id_idx" 
      ON "speakers" USING btree ("user_id");
    CREATE INDEX IF NOT EXISTS "users_speaker_id_idx" 
      ON "users" USING btree ("speaker_id");
    CREATE INDEX IF NOT EXISTS "users_abstract_id_idx" 
      ON "users" USING btree ("abstract_id");
    CREATE INDEX IF NOT EXISTS "abstracts_user_id_idx" 
      ON "abstracts" USING btree ("user_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Drop indexes
    DROP INDEX IF EXISTS "abstracts_user_id_idx";
    DROP INDEX IF EXISTS "users_abstract_id_idx";
    DROP INDEX IF EXISTS "users_speaker_id_idx";
    DROP INDEX IF EXISTS "speakers_user_id_idx";
    DROP INDEX IF EXISTS "speakers_email_idx";
    
    -- Drop foreign key constraints
    ALTER TABLE "abstracts" 
      DROP CONSTRAINT IF EXISTS "abstracts_user_id_fkey";
    ALTER TABLE "users" 
      DROP CONSTRAINT IF EXISTS "users_abstract_id_fkey";
    ALTER TABLE "users" 
      DROP CONSTRAINT IF EXISTS "users_speaker_id_fkey";
    ALTER TABLE "speakers" 
      DROP CONSTRAINT IF EXISTS "speakers_user_id_fkey";
    
    -- Drop columns
    ALTER TABLE "abstracts" 
      DROP COLUMN IF EXISTS "user_id";
    ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "abstract_id";
    ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "speaker_id";
    ALTER TABLE "speakers" 
      DROP COLUMN IF EXISTS "user_id";
    ALTER TABLE "speakers" 
      DROP COLUMN IF EXISTS "email";
    
    -- Note: Cannot remove enum values in PostgreSQL, so we leave them
    -- The enum values 'speaker' and 'presenter' will remain but won't be used
  `)
}

