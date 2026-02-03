-- Create orathon_registrations table for Day 4 Orathon Marathon Activity registrations
-- This table stores registrations for the post-conference Orathon activity.
-- Column names use snake_case to match Payload's PostgreSQL adapter.

CREATE TABLE IF NOT EXISTS orathon_registrations (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(255) NOT NULL,
  date_of_birth TIMESTAMP,
  gender VARCHAR(50) NOT NULL CHECK (gender IN ('male', 'female', 'other', 'prefer-not-to-say')),
  country VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  emergency_contact_name VARCHAR(255) NOT NULL,
  emergency_contact_phone VARCHAR(255) NOT NULL,
  medical_conditions TEXT,
  fitness_level VARCHAR(50) NOT NULL CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  tshirt_size VARCHAR(10) NOT NULL CHECK (tshirt_size IN ('xs', 's', 'm', 'l', 'xl', 'xxl')),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orathon_registrations_email ON orathon_registrations(email);
CREATE INDEX IF NOT EXISTS idx_orathon_registrations_status ON orathon_registrations(status);
CREATE INDEX IF NOT EXISTS idx_orathon_registrations_created_at ON orathon_registrations(created_at);

-- Trigger to keep updated_at in sync
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

COMMENT ON TABLE orathon_registrations IS 'Stores registrations for the Day 4 Orathon Marathon Activity (Post-Conference Activity)';
