-- Fix orathon_registrations: rename camelCase columns to snake_case
-- Run this if you get: column "first_name" does not exist (Perhaps you meant "firstName".)
-- Payload's PostgreSQL adapter expects snake_case column names.

DO $$
BEGIN
  -- Rename columns only if camelCase version exists (table was created with old script)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orathon_registrations' AND column_name = 'firstName') THEN
    ALTER TABLE orathon_registrations RENAME COLUMN "firstName" TO first_name;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orathon_registrations' AND column_name = 'lastName') THEN
    ALTER TABLE orathon_registrations RENAME COLUMN "lastName" TO last_name;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orathon_registrations' AND column_name = 'dateOfBirth') THEN
    ALTER TABLE orathon_registrations RENAME COLUMN "dateOfBirth" TO date_of_birth;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orathon_registrations' AND column_name = 'emergencyContactName') THEN
    ALTER TABLE orathon_registrations RENAME COLUMN "emergencyContactName" TO emergency_contact_name;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orathon_registrations' AND column_name = 'emergencyContactPhone') THEN
    ALTER TABLE orathon_registrations RENAME COLUMN "emergencyContactPhone" TO emergency_contact_phone;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orathon_registrations' AND column_name = 'medicalConditions') THEN
    ALTER TABLE orathon_registrations RENAME COLUMN "medicalConditions" TO medical_conditions;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orathon_registrations' AND column_name = 'fitnessLevel') THEN
    ALTER TABLE orathon_registrations RENAME COLUMN "fitnessLevel" TO fitness_level;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orathon_registrations' AND column_name = 'tshirtSize') THEN
    ALTER TABLE orathon_registrations RENAME COLUMN "tshirtSize" TO tshirt_size;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orathon_registrations' AND column_name = 'createdAt') THEN
    ALTER TABLE orathon_registrations RENAME COLUMN "createdAt" TO created_at;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orathon_registrations' AND column_name = 'updatedAt') THEN
    ALTER TABLE orathon_registrations RENAME COLUMN "updatedAt" TO updated_at;
  END IF;
END $$;

-- Recreate updated_at trigger to use snake_case column
CREATE OR REPLACE FUNCTION update_orathon_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_orathon_registrations_updated_at ON orathon_registrations;
CREATE TRIGGER update_orathon_registrations_updated_at
  BEFORE UPDATE ON orathon_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_orathon_registrations_updated_at();
