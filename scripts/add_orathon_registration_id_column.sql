-- Add registration_id column for Orathon registrations (tracking ID)
-- Safe to run multiple times.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orathon_registrations' AND column_name = 'registration_id'
  ) THEN
    ALTER TABLE orathon_registrations ADD COLUMN registration_id VARCHAR(50) UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_orathon_registrations_registration_id ON orathon_registrations(registration_id);
  END IF;
END $$;
