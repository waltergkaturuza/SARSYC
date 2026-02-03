-- Create orathon_registrations table for Day 4 Orathon Marathon Activity registrations
-- This table stores registrations for the post-conference Orathon activity

CREATE TABLE IF NOT EXISTS orathon_registrations (
  id SERIAL PRIMARY KEY,
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(255) NOT NULL,
  "dateOfBirth" TIMESTAMP,
  gender VARCHAR(50) NOT NULL CHECK (gender IN ('male', 'female', 'other', 'prefer-not-to-say')),
  country VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  "emergencyContactName" VARCHAR(255) NOT NULL,
  "emergencyContactPhone" VARCHAR(255) NOT NULL,
  "medicalConditions" TEXT,
  "fitnessLevel" VARCHAR(50) NOT NULL CHECK ("fitnessLevel" IN ('beginner', 'intermediate', 'advanced')),
  "tshirtSize" VARCHAR(10) NOT NULL CHECK ("tshirtSize" IN ('xs', 's', 'm', 'l', 'xl', 'xxl')),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  notes TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orathon_registrations_email ON orathon_registrations(email);
CREATE INDEX IF NOT EXISTS idx_orathon_registrations_status ON orathon_registrations(status);
CREATE INDEX IF NOT EXISTS idx_orathon_registrations_created_at ON orathon_registrations("createdAt");

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_orathon_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orathon_registrations_updated_at
  BEFORE UPDATE ON orathon_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_orathon_registrations_updated_at();

-- Add comment to table
COMMENT ON TABLE orathon_registrations IS 'Stores registrations for the Day 4 Orathon Marathon Activity (Post-Conference Activity)';
