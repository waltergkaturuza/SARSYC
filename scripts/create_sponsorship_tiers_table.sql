-- Migration: Create sponsorship_tiers table
-- Date: 2025-12-27
-- Description: Creates the sponsorship_tiers table and related structures for dynamic sponsorship tier management

-- Create benefits array table
CREATE TABLE IF NOT EXISTS "sponsorship_tiers_benefits" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "benefit" varchar
);

-- Create main sponsorship_tiers table
CREATE TABLE IF NOT EXISTS "sponsorship_tiers" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar NOT NULL,
  "price" varchar NOT NULL,
  "order" numeric NOT NULL DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "is_popular" boolean DEFAULT false,
  "icon" varchar NOT NULL DEFAULT 'star',
  "color" varchar NOT NULL DEFAULT 'gray',
  "description" varchar,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

-- Add foreign key for benefits array
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sponsorship_tiers_benefits_parent_fk'
  ) THEN
    ALTER TABLE "sponsorship_tiers_benefits" 
      ADD CONSTRAINT "sponsorship_tiers_benefits_parent_fk" 
      FOREIGN KEY ("_parent_id") 
      REFERENCES "public"."sponsorship_tiers"("id") 
      ON DELETE cascade 
      ON UPDATE no action;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS "sponsorship_tiers_benefits_order_idx" 
  ON "sponsorship_tiers_benefits" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "sponsorship_tiers_benefits_parent_idx" 
  ON "sponsorship_tiers_benefits" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "sponsorship_tiers_order_idx" 
  ON "sponsorship_tiers" USING btree ("order");
CREATE INDEX IF NOT EXISTS "sponsorship_tiers_is_active_idx" 
  ON "sponsorship_tiers" USING btree ("is_active");
CREATE INDEX IF NOT EXISTS "sponsorship_tiers_updated_at_idx" 
  ON "sponsorship_tiers" USING btree ("updated_at");
CREATE INDEX IF NOT EXISTS "sponsorship_tiers_created_at_idx" 
  ON "sponsorship_tiers" USING btree ("created_at");

-- Add to payload_locked_documents_rels if needed
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payload_locked_documents_rels' 
    AND column_name = 'sponsorship_tiers_id'
  ) THEN
    ALTER TABLE "payload_locked_documents_rels" 
      ADD COLUMN "sponsorship_tiers_id" integer;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_sponsorship_tiers_fk'
  ) THEN
    ALTER TABLE "payload_locked_documents_rels" 
      ADD CONSTRAINT "payload_locked_documents_rels_sponsorship_tiers_fk" 
      FOREIGN KEY ("sponsorship_tiers_id") 
      REFERENCES "public"."sponsorship_tiers"("id") 
      ON DELETE cascade 
      ON UPDATE no action;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_sponsorship_tiers_id_idx" 
  ON "payload_locked_documents_rels" USING btree ("sponsorship_tiers_id");

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE 'Sponsorship tiers table created successfully!';
END $$;

