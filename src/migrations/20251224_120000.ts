import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE registrations ADD COLUMN IF NOT EXISTS deleted_at timestamp(3) with time zone;

    CREATE TABLE IF NOT EXISTS participants (
      id serial PRIMARY KEY NOT NULL,
      first_name varchar NOT NULL,
      last_name varchar NOT NULL,
      email varchar NOT NULL,
      phone varchar,
      country varchar,
      organization varchar,
      job_title varchar,
      photo_id integer,
      registration_id integer,
      ticket_type varchar,
      payment_status varchar,
      checked_in boolean DEFAULT false,
      checked_in_at timestamp(3) with time zone,
      badges_printed_at timestamp(3) with time zone,
      notes varchar,
      tags jsonb,
      updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
      created_at timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS participants_email_unique ON participants (email);
    CREATE INDEX IF NOT EXISTS participants_registration_idx ON participants (registration_id);

    ALTER TABLE participants
      ADD CONSTRAINT IF NOT EXISTS participants_registration_fk FOREIGN KEY (registration_id) REFERENCES registrations (id) ON DELETE SET NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_registration_fk;
    DROP INDEX IF EXISTS participants_email_unique;
    DROP INDEX IF EXISTS participants_registration_idx;
    DROP TABLE IF EXISTS participants;
    ALTER TABLE registrations DROP COLUMN IF EXISTS deleted_at;
  `)
}
