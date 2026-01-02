import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_registrations_gender" AS ENUM('male', 'female', 'other', 'prefer-not-to-say');
  CREATE TYPE "public"."enum_registrations_visa_status" AS ENUM('not-applied', 'applied-pending', 'approved', 'denied');
  CREATE TYPE "public"."enum_registrations_national_id_type" AS ENUM('national-id', 'drivers-license', 'other');
  CREATE TYPE "public"."enum_registrations_blood_type" AS ENUM('a-positive', 'a-negative', 'b-positive', 'b-negative', 'ab-positive', 'ab-negative', 'o-positive', 'o-negative', 'unknown');
  CREATE TYPE "public"."enum_registrations_security_check_status" AS ENUM('pending', 'in-progress', 'cleared', 'flagged');
  CREATE TYPE "public"."enum_participants_dietary_restrictions" AS ENUM('none', 'vegetarian', 'vegan', 'halal', 'gluten-free', 'other');
  CREATE TYPE "public"."enum_participants_ticket_type" AS ENUM('standard', 'student', 'vip');
  CREATE TYPE "public"."enum_participants_payment_status" AS ENUM('pending', 'paid', 'waived');
  CREATE TABLE "participants_dietary_restrictions" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_participants_dietary_restrictions",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "participants_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "participants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"country" varchar,
  	"organization" varchar,
  	"job_title" varchar,
  	"photo_id" integer,
  	"accessibility_needs" varchar,
  	"registration_id" integer,
  	"ticket_type" "enum_participants_ticket_type",
  	"payment_status" "enum_participants_payment_status",
  	"checked_in" boolean DEFAULT false,
  	"checked_in_at" timestamp(3) with time zone,
  	"badges_printed_at" timestamp(3) with time zone,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "registrations" ADD COLUMN "date_of_birth" timestamp(3) with time zone NOT NULL;
  ALTER TABLE "registrations" ADD COLUMN "gender" "enum_registrations_gender" NOT NULL;
  ALTER TABLE "registrations" ADD COLUMN "nationality" varchar NOT NULL;
  ALTER TABLE "registrations" ADD COLUMN "city" varchar NOT NULL;
  ALTER TABLE "registrations" ADD COLUMN "address" varchar NOT NULL;
  ALTER TABLE "registrations" ADD COLUMN "organization_position" varchar;
  ALTER TABLE "registrations" ADD COLUMN "is_international" boolean DEFAULT false;
  ALTER TABLE "registrations" ADD COLUMN "passport_number" varchar;
  ALTER TABLE "registrations" ADD COLUMN "passport_expiry" timestamp(3) with time zone;
  ALTER TABLE "registrations" ADD COLUMN "passport_issuing_country" varchar;
  ALTER TABLE "registrations" ADD COLUMN "visa_required" boolean DEFAULT true;
  ALTER TABLE "registrations" ADD COLUMN "visa_status" "enum_registrations_visa_status";
  ALTER TABLE "registrations" ADD COLUMN "visa_application_date" timestamp(3) with time zone;
  ALTER TABLE "registrations" ADD COLUMN "visa_number" varchar;
  ALTER TABLE "registrations" ADD COLUMN "national_id_number" varchar;
  ALTER TABLE "registrations" ADD COLUMN "national_id_type" "enum_registrations_national_id_type";
  ALTER TABLE "registrations" ADD COLUMN "emergency_contact_name" varchar NOT NULL;
  ALTER TABLE "registrations" ADD COLUMN "emergency_contact_relationship" varchar NOT NULL;
  ALTER TABLE "registrations" ADD COLUMN "emergency_contact_phone" varchar NOT NULL;
  ALTER TABLE "registrations" ADD COLUMN "emergency_contact_email" varchar;
  ALTER TABLE "registrations" ADD COLUMN "emergency_contact_address" varchar;
  ALTER TABLE "registrations" ADD COLUMN "arrival_date" timestamp(3) with time zone;
  ALTER TABLE "registrations" ADD COLUMN "departure_date" timestamp(3) with time zone;
  ALTER TABLE "registrations" ADD COLUMN "flight_number" varchar;
  ALTER TABLE "registrations" ADD COLUMN "accommodation_required" boolean DEFAULT false;
  ALTER TABLE "registrations" ADD COLUMN "accommodation_preferences" varchar;
  ALTER TABLE "registrations" ADD COLUMN "has_health_insurance" boolean DEFAULT false;
  ALTER TABLE "registrations" ADD COLUMN "insurance_provider" varchar;
  ALTER TABLE "registrations" ADD COLUMN "insurance_policy_number" varchar;
  ALTER TABLE "registrations" ADD COLUMN "medical_conditions" varchar;
  ALTER TABLE "registrations" ADD COLUMN "blood_type" "enum_registrations_blood_type";
  ALTER TABLE "registrations" ADD COLUMN "security_check_status" "enum_registrations_security_check_status" DEFAULT 'pending';
  ALTER TABLE "registrations" ADD COLUMN "security_check_notes" varchar;
  ALTER TABLE "registrations" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "participants_id" integer;
  ALTER TABLE "participants_dietary_restrictions" ADD CONSTRAINT "participants_dietary_restrictions_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "participants_tags" ADD CONSTRAINT "participants_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "participants" ADD CONSTRAINT "participants_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "participants" ADD CONSTRAINT "participants_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "participants_dietary_restrictions_order_idx" ON "participants_dietary_restrictions" USING btree ("order");
  CREATE INDEX "participants_dietary_restrictions_parent_idx" ON "participants_dietary_restrictions" USING btree ("parent_id");
  CREATE INDEX "participants_tags_order_idx" ON "participants_tags" USING btree ("_order");
  CREATE INDEX "participants_tags_parent_id_idx" ON "participants_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "participants_email_idx" ON "participants" USING btree ("email");
  CREATE INDEX "participants_photo_idx" ON "participants" USING btree ("photo_id");
  CREATE INDEX "participants_registration_idx" ON "participants" USING btree ("registration_id");
  CREATE INDEX "participants_updated_at_idx" ON "participants" USING btree ("updated_at");
  CREATE INDEX "participants_created_at_idx" ON "participants" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_participants_fk" FOREIGN KEY ("participants_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_participants_id_idx" ON "payload_locked_documents_rels" USING btree ("participants_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // ⚠️ WARNING: This down() function will DELETE ALL participants data!
  // ⚠️ NEVER run this in production! This is ONLY for development/testing.
  // ⚠️ If you need to rollback in production, create a new migration instead.
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
    throw new Error(
      '🚨 CRITICAL: Migration rollback is FORBIDDEN in production! ' +
      'This would DELETE ALL participants data. If you need to fix something, create a new migration instead.'
    )
  }
  
  await db.execute(sql`
   ALTER TABLE "participants_dietary_restrictions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "participants_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "participants" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "participants_dietary_restrictions" CASCADE;
  DROP TABLE "participants_tags" CASCADE;
  DROP TABLE "participants" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_participants_fk";
  
  DROP INDEX "payload_locked_documents_rels_participants_id_idx";
  ALTER TABLE "registrations" DROP COLUMN "date_of_birth";
  ALTER TABLE "registrations" DROP COLUMN "gender";
  ALTER TABLE "registrations" DROP COLUMN "nationality";
  ALTER TABLE "registrations" DROP COLUMN "city";
  ALTER TABLE "registrations" DROP COLUMN "address";
  ALTER TABLE "registrations" DROP COLUMN "organization_position";
  ALTER TABLE "registrations" DROP COLUMN "is_international";
  ALTER TABLE "registrations" DROP COLUMN "passport_number";
  ALTER TABLE "registrations" DROP COLUMN "passport_expiry";
  ALTER TABLE "registrations" DROP COLUMN "passport_issuing_country";
  ALTER TABLE "registrations" DROP COLUMN "visa_required";
  ALTER TABLE "registrations" DROP COLUMN "visa_status";
  ALTER TABLE "registrations" DROP COLUMN "visa_application_date";
  ALTER TABLE "registrations" DROP COLUMN "visa_number";
  ALTER TABLE "registrations" DROP COLUMN "national_id_number";
  ALTER TABLE "registrations" DROP COLUMN "national_id_type";
  ALTER TABLE "registrations" DROP COLUMN "emergency_contact_name";
  ALTER TABLE "registrations" DROP COLUMN "emergency_contact_relationship";
  ALTER TABLE "registrations" DROP COLUMN "emergency_contact_phone";
  ALTER TABLE "registrations" DROP COLUMN "emergency_contact_email";
  ALTER TABLE "registrations" DROP COLUMN "emergency_contact_address";
  ALTER TABLE "registrations" DROP COLUMN "arrival_date";
  ALTER TABLE "registrations" DROP COLUMN "departure_date";
  ALTER TABLE "registrations" DROP COLUMN "flight_number";
  ALTER TABLE "registrations" DROP COLUMN "accommodation_required";
  ALTER TABLE "registrations" DROP COLUMN "accommodation_preferences";
  ALTER TABLE "registrations" DROP COLUMN "has_health_insurance";
  ALTER TABLE "registrations" DROP COLUMN "insurance_provider";
  ALTER TABLE "registrations" DROP COLUMN "insurance_policy_number";
  ALTER TABLE "registrations" DROP COLUMN "medical_conditions";
  ALTER TABLE "registrations" DROP COLUMN "blood_type";
  ALTER TABLE "registrations" DROP COLUMN "security_check_status";
  ALTER TABLE "registrations" DROP COLUMN "security_check_notes";
  ALTER TABLE "registrations" DROP COLUMN "deleted_at";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "participants_id";
  DROP TYPE "public"."enum_registrations_gender";
  DROP TYPE "public"."enum_registrations_visa_status";
  DROP TYPE "public"."enum_registrations_national_id_type";
  DROP TYPE "public"."enum_registrations_blood_type";
  DROP TYPE "public"."enum_registrations_security_check_status";
  DROP TYPE "public"."enum_participants_dietary_restrictions";
  DROP TYPE "public"."enum_participants_ticket_type";
  DROP TYPE "public"."enum_participants_payment_status";`)
}
