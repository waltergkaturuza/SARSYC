import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    CREATE TABLE IF NOT EXISTS "donations" (
      "id"                          serial PRIMARY KEY,
      "donation_id"                 varchar UNIQUE NOT NULL,
      "type"                        varchar NOT NULL DEFAULT 'donation',
      "donor_type"                  varchar NOT NULL DEFAULT 'individual',
      "donor_name"                  varchar,
      "first_name"                  varchar,
      "last_name"                   varchar,
      "org_name"                    varchar,
      "email"                       varchar NOT NULL,
      "phone"                       varchar,
      "amount_usd"                  numeric NOT NULL,
      "currency"                    varchar NOT NULL DEFAULT 'USD',
      "message"                     text,
      "sponsorship_tier_name"       varchar,
      "sponsorship_tier_id"         integer,
      "payment_method"              varchar NOT NULL DEFAULT 'card',
      "payment_status"              varchar NOT NULL DEFAULT 'pending',
      "stanbic_payment_order_ref"   varchar,
      "payment_confirmed_at"        timestamptz,
      "notes"                       text,
      "updated_at"                  timestamptz NOT NULL DEFAULT now(),
      "created_at"                  timestamptz NOT NULL DEFAULT now()
    );
  `)

  await payload.db.drizzle.execute(`
    ALTER TABLE "sponsorship_tiers"
      ADD COLUMN IF NOT EXISTS "price_amount_usd" numeric;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`DROP TABLE IF EXISTS "donations";`)
  await payload.db.drizzle.execute(`
    ALTER TABLE "sponsorship_tiers" DROP COLUMN IF EXISTS "price_amount_usd";
  `)
}
