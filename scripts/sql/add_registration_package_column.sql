-- Run on production Postgres if migrations did not apply (e.g. serverless deploy).
-- Safe to run multiple times.
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "stanbic_payment_order_ref" varchar;
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "registration_package" varchar;
