import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_registrations_emergency_contact_relationship" AS ENUM('spouse-partner', 'parent', 'sibling', 'child', 'other-relative', 'friend', 'colleague', 'other');
  ALTER TABLE "registrations" ALTER COLUMN "emergency_contact_relationship" SET DATA TYPE "public"."enum_registrations_emergency_contact_relationship" USING "emergency_contact_relationship"::"public"."enum_registrations_emergency_contact_relationship";
  ALTER TABLE "registrations" ALTER COLUMN "emergency_contact_email" SET NOT NULL;
  ALTER TABLE "registrations" ALTER COLUMN "emergency_contact_address" SET NOT NULL;
  ALTER TABLE "registrations" ADD COLUMN "passport_scan_id" integer;
  ALTER TABLE "registrations" ADD COLUMN "emergency_contact_country" varchar NOT NULL;
  ALTER TABLE "registrations" ADD COLUMN "emergency_contact_city" varchar NOT NULL;
  ALTER TABLE "registrations" ADD COLUMN "emergency_contact_postal_code" varchar;
  ALTER TABLE "registrations" ADD COLUMN "travel_insurance_provider" varchar;
  ALTER TABLE "registrations" ADD COLUMN "travel_insurance_policy_number" varchar;
  ALTER TABLE "registrations" ADD COLUMN "travel_insurance_expiry" timestamp(3) with time zone;
  ALTER TABLE "registrations" ADD COLUMN "visa_invitation_letter_required" boolean DEFAULT true;
  ALTER TABLE "registrations" ADD CONSTRAINT "registrations_passport_scan_id_media_id_fk" FOREIGN KEY ("passport_scan_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "registrations_passport_scan_idx" ON "registrations" USING btree ("passport_scan_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "registrations" DROP CONSTRAINT "registrations_passport_scan_id_media_id_fk";
  
  DROP INDEX "registrations_passport_scan_idx";
  ALTER TABLE "registrations" ALTER COLUMN "emergency_contact_relationship" SET DATA TYPE varchar;
  ALTER TABLE "registrations" ALTER COLUMN "emergency_contact_email" DROP NOT NULL;
  ALTER TABLE "registrations" ALTER COLUMN "emergency_contact_address" DROP NOT NULL;
  ALTER TABLE "registrations" DROP COLUMN "passport_scan_id";
  ALTER TABLE "registrations" DROP COLUMN "emergency_contact_country";
  ALTER TABLE "registrations" DROP COLUMN "emergency_contact_city";
  ALTER TABLE "registrations" DROP COLUMN "emergency_contact_postal_code";
  ALTER TABLE "registrations" DROP COLUMN "travel_insurance_provider";
  ALTER TABLE "registrations" DROP COLUMN "travel_insurance_policy_number";
  ALTER TABLE "registrations" DROP COLUMN "travel_insurance_expiry";
  ALTER TABLE "registrations" DROP COLUMN "visa_invitation_letter_required";
  DROP TYPE "public"."enum_registrations_emergency_contact_relationship";`)
}
