-- Run on production Postgres if migrations did not apply (e.g. serverless deploy).
-- Adds stanbic ref, registration_package, and payment_follow_up_sent_at when missing.
-- Safe to run multiple times.
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "stanbic_payment_order_ref" varchar;
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "registration_package" varchar;
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "payment_follow_up_sent_at" timestamp with time zone;
