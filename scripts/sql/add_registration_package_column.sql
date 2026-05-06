-- Run on production Postgres if a deploy hasn't applied Payload migrations yet.
-- Safe to run multiple times.
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "registration_package" varchar;
