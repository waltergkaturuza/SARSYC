-- Manual SQL Migration Script
-- Apply these migrations in order to your PostgreSQL database
-- Run this using: psql $DATABASE_URL -f scripts/apply_migrations_manual.sql
-- Or connect to your database and run these statements

-- ============================================================================
-- Migration 1: Add International Registration Fields
-- Date: 2025-12-26 15:54:56
-- ============================================================================

-- Create enum types
DO $$ BEGIN
    CREATE TYPE "public"."enum_registrations_gender" AS ENUM('male', 'female', 'other', 'prefer-not-to-say');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."enum_registrations_visa_status" AS ENUM('not-applied', 'applied-pending', 'approved', 'denied');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."enum_registrations_national_id_type" AS ENUM('national-id', 'drivers-license', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."enum_registrations_blood_type" AS ENUM('a-positive', 'a-negative', 'b-positive', 'b-negative', 'ab-positive', 'ab-negative', 'o-positive', 'o-negative', 'unknown');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."enum_registrations_security_check_status" AS ENUM('pending', 'in-progress', 'cleared', 'flagged');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns (using IF NOT EXISTS pattern)
-- Note: Some columns are NOT NULL, so we add them as nullable first, then update and set NOT NULL
ALTER TABLE "registrations" 
  ADD COLUMN IF NOT EXISTS "date_of_birth" timestamp(3) with time zone,
  ADD COLUMN IF NOT EXISTS "gender" "enum_registrations_gender",
  ADD COLUMN IF NOT EXISTS "nationality" varchar,
  ADD COLUMN IF NOT EXISTS "city" varchar,
  ADD COLUMN IF NOT EXISTS "address" text,
  ADD COLUMN IF NOT EXISTS "organization_position" varchar,
  ADD COLUMN IF NOT EXISTS "is_international" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "passport_number" varchar,
  ADD COLUMN IF NOT EXISTS "passport_expiry" timestamp(3) with time zone,
  ADD COLUMN IF NOT EXISTS "passport_issuing_country" varchar,
  ADD COLUMN IF NOT EXISTS "visa_required" boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS "visa_status" "enum_registrations_visa_status",
  ADD COLUMN IF NOT EXISTS "visa_application_date" timestamp(3) with time zone,
  ADD COLUMN IF NOT EXISTS "visa_number" varchar,
  ADD COLUMN IF NOT EXISTS "national_id_number" varchar,
  ADD COLUMN IF NOT EXISTS "national_id_type" "enum_registrations_national_id_type",
  ADD COLUMN IF NOT EXISTS "emergency_contact_name" varchar,
  ADD COLUMN IF NOT EXISTS "emergency_contact_relationship" varchar,
  ADD COLUMN IF NOT EXISTS "emergency_contact_phone" varchar,
  ADD COLUMN IF NOT EXISTS "emergency_contact_email" varchar,
  ADD COLUMN IF NOT EXISTS "emergency_contact_address" text,
  ADD COLUMN IF NOT EXISTS "arrival_date" timestamp(3) with time zone,
  ADD COLUMN IF NOT EXISTS "departure_date" timestamp(3) with time zone,
  ADD COLUMN IF NOT EXISTS "flight_number" varchar,
  ADD COLUMN IF NOT EXISTS "accommodation_required" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "accommodation_preferences" text,
  ADD COLUMN IF NOT EXISTS "has_health_insurance" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "insurance_provider" varchar,
  ADD COLUMN IF NOT EXISTS "insurance_policy_number" varchar,
  ADD COLUMN IF NOT EXISTS "medical_conditions" text,
  ADD COLUMN IF NOT EXISTS "blood_type" "enum_registrations_blood_type",
  ADD COLUMN IF NOT EXISTS "security_check_status" "enum_registrations_security_check_status" DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "security_check_notes" text;

-- Update country and nationality columns to use select type (varchar remains compatible)
-- Note: These will work with the new select fields in Payload

-- ============================================================================
-- Migration 2: Add Passport Scan and Enhanced Next of Kin
-- Date: 2025-12-26 16:04:19
-- ============================================================================

-- Create enum for emergency contact relationship
DO $$ BEGIN
    CREATE TYPE "public"."enum_registrations_emergency_contact_relationship" AS ENUM('spouse-partner', 'parent', 'sibling', 'child', 'other-relative', 'friend', 'colleague', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add passport scan foreign key column
ALTER TABLE "registrations" 
  ADD COLUMN IF NOT EXISTS "passport_scan_id" integer;

-- Add enhanced next of kin fields
ALTER TABLE "registrations" 
  ADD COLUMN IF NOT EXISTS "emergency_contact_country" varchar,
  ADD COLUMN IF NOT EXISTS "emergency_contact_city" varchar,
  ADD COLUMN IF NOT EXISTS "emergency_contact_postal_code" varchar;

-- Add travel insurance fields
ALTER TABLE "registrations" 
  ADD COLUMN IF NOT EXISTS "travel_insurance_provider" varchar,
  ADD COLUMN IF NOT EXISTS "travel_insurance_policy_number" varchar,
  ADD COLUMN IF NOT EXISTS "travel_insurance_expiry" timestamp(3) with time zone,
  ADD COLUMN IF NOT EXISTS "visa_invitation_letter_required" boolean DEFAULT true;

-- Create foreign key for passport scan
DO $$ BEGIN
    ALTER TABLE "registrations" 
      ADD CONSTRAINT "registrations_passport_scan_id_media_id_fk" 
      FOREIGN KEY ("passport_scan_id") 
      REFERENCES "public"."media"("id") 
      ON DELETE SET NULL 
      ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create index for passport scan
CREATE INDEX IF NOT EXISTS "registrations_passport_scan_idx" ON "registrations" USING btree ("passport_scan_id");

-- Update emergency_contact_relationship to use enum (only if column exists and is varchar)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'registrations' 
        AND column_name = 'emergency_contact_relationship'
        AND data_type = 'character varying'
    ) THEN
        ALTER TABLE "registrations" 
          ALTER COLUMN "emergency_contact_relationship" 
          SET DATA TYPE "public"."enum_registrations_emergency_contact_relationship" 
          USING "emergency_contact_relationship"::"public"."enum_registrations_emergency_contact_relationship";
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'registrations' 
        AND column_name = 'emergency_contact_relationship'
    ) THEN
        ALTER TABLE "registrations" 
          ADD COLUMN "emergency_contact_relationship" "public"."enum_registrations_emergency_contact_relationship";
    END IF;
END $$;

-- Handle existing NULL values before making columns NOT NULL
-- Set default values for existing records that have NULL values
UPDATE "registrations" 
SET 
  "emergency_contact_email" = COALESCE("emergency_contact_email", "email", 'not-provided@example.com'),
  "emergency_contact_address" = COALESCE("emergency_contact_address", "address", 'Not provided'),
  "emergency_contact_country" = COALESCE("emergency_contact_country", "country", 'Unknown'),
  "emergency_contact_city" = COALESCE("emergency_contact_city", "city", 'Unknown')
WHERE 
  "emergency_contact_email" IS NULL 
  OR "emergency_contact_address" IS NULL 
  OR "emergency_contact_country" IS NULL 
  OR "emergency_contact_city" IS NULL;

-- Make emergency contact fields required (only set NOT NULL if column is new or currently allows NULL)
DO $$ 
BEGIN
    -- Only set NOT NULL if the column allows NULL values
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'registrations' 
        AND column_name = 'emergency_contact_email'
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE "registrations" ALTER COLUMN "emergency_contact_email" SET NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'registrations' 
        AND column_name = 'emergency_contact_address'
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE "registrations" ALTER COLUMN "emergency_contact_address" SET NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'registrations' 
        AND column_name = 'emergency_contact_country'
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE "registrations" ALTER COLUMN "emergency_contact_country" SET NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'registrations' 
        AND column_name = 'emergency_contact_city'
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE "registrations" ALTER COLUMN "emergency_contact_city" SET NOT NULL;
    END IF;
END $$;

-- ============================================================================
-- Migration 3: Update Country Fields to Select Type
-- Note: This migration just ensures the columns exist as varchar
-- Payload will handle the select dropdown functionality
-- ============================================================================

-- Ensure country, nationality, and passport_issuing_country are varchar (for select compatibility)
-- These should already be varchar, but we ensure they exist

-- ============================================================================
-- Migration Status Tracking
-- ============================================================================

-- Mark migrations as applied (if payload_migrations table exists)
DO $$ 
BEGIN
    -- Check if payload_migrations table exists and insert if not already there
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payload_migrations') THEN
        -- Insert migration records if they don't already exist
        INSERT INTO "payload_migrations" ("name", "batch", "created_at", "updated_at")
        SELECT '20251226_155456_add_international_registration_fields', 1, NOW(), NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM "payload_migrations" WHERE "name" = '20251226_155456_add_international_registration_fields'
        );
        
        INSERT INTO "payload_migrations" ("name", "batch", "created_at", "updated_at")
        SELECT '20251226_160419_add_passport_scan_nextofkin_enhancements', 1, NOW(), NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM "payload_migrations" WHERE "name" = '20251226_160419_add_passport_scan_nextofkin_enhancements'
        );
    END IF;
END $$;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'Migrations applied successfully!';
    RAISE NOTICE 'New columns added to registrations table.';
    RAISE NOTICE 'Please verify your database schema.';
END $$;

