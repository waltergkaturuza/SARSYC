-- Update existing speakers with email addresses
-- Replace these with actual email addresses for your speakers

-- Update speaker ID 1 (Greenford Walter Walter KATURUZA)
-- Replace 'speaker1@example.com' with the actual email
UPDATE "speakers" 
SET "email" = 'speaker1@example.com' 
WHERE "id" = 1 AND ("email" IS NULL OR "email" = '');

-- Update speaker ID 2 (Dr. Sarah Mwangi)
-- Replace 'speaker2@example.com' with the actual email
UPDATE "speakers" 
SET "email" = 'speaker2@example.com' 
WHERE "id" = 2 AND ("email" IS NULL OR "email" = '');

-- Verify the updates
SELECT "id", "name", "email" FROM "speakers" WHERE "id" IN (1, 2);


