-- Reset schema to ensure idempotent run (drops all objects in public)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'contributor');
  CREATE TYPE "public"."enum_registrations_dietary_restrictions" AS ENUM('none', 'vegetarian', 'vegan', 'halal', 'gluten-free', 'other');
  CREATE TYPE "public"."enum_registrations_category" AS ENUM('student', 'researcher', 'policymaker', 'partner', 'observer');
  CREATE TYPE "public"."enum_registrations_tshirt_size" AS ENUM('xs', 's', 'm', 'l', 'xl', 'xxl');
  CREATE TYPE "public"."enum_registrations_status" AS ENUM('pending', 'confirmed', 'cancelled');
  CREATE TYPE "public"."enum_registrations_payment_status" AS ENUM('pending', 'paid', 'waived');
  CREATE TYPE "public"."enum_abstracts_track" AS ENUM('srhr', 'education', 'advocacy', 'innovation');
  CREATE TYPE "public"."enum_abstracts_presentation_type" AS ENUM('oral', 'poster', 'either');
  CREATE TYPE "public"."enum_abstracts_status" AS ENUM('received', 'under-review', 'revisions', 'accepted', 'rejected');
  CREATE TYPE "public"."enum_speakers_type" AS ENUM('keynote', 'plenary', 'moderator', 'facilitator', 'presenter');
  CREATE TYPE "public"."enum_sessions_type" AS ENUM('keynote', 'plenary', 'panel', 'workshop', 'oral', 'poster', 'networking', 'side-event');
  CREATE TYPE "public"."enum_sessions_track" AS ENUM('srhr', 'education', 'advocacy', 'innovation', 'general');
  CREATE TYPE "public"."enum_resources_topics" AS ENUM('srh', 'education', 'advocacy', 'policy', 'innovation', 'empowerment', 'gender', 'hiv', 'research');
  CREATE TYPE "public"."enum_resources_type" AS ENUM('report', 'paper', 'brief', 'presentation', 'toolkit', 'infographic', 'video', 'other');
  CREATE TYPE "public"."enum_resources_sarsyc_edition" AS ENUM('1', '2', '3', '4', '5', '6', 'other');
  CREATE TYPE "public"."enum_resources_language" AS ENUM('en', 'fr', 'pt');
  CREATE TYPE "public"."enum_news_category" AS ENUM('conference', 'speakers', 'partnerships', 'youth-stories', 'research', 'advocacy', 'events');
  CREATE TYPE "public"."enum_news_status" AS ENUM('draft', 'published', 'archived');
  CREATE TYPE "public"."enum_partners_sarsyc_editions" AS ENUM('1', '2', '3', '4', '5', '6');
  CREATE TYPE "public"."enum_partners_type" AS ENUM('implementing', 'funding', 'technical', 'media', 'sponsor');
  CREATE TYPE "public"."enum_partners_tier" AS ENUM('platinum', 'gold', 'silver', 'bronze', 'in-kind', 'n/a');
  CREATE TYPE "public"."enum_faqs_category" AS ENUM('general', 'registration', 'abstracts', 'travel', 'visa', 'programme', 'accessibility', 'partnerships');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"organization" varchar,
  	"phone" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "registrations_dietary_restrictions" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_registrations_dietary_restrictions",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "registrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"country" varchar NOT NULL,
  	"organization" varchar NOT NULL,
  	"category" "enum_registrations_category" NOT NULL,
  	"accessibility_needs" varchar,
  	"tshirt_size" "enum_registrations_tshirt_size",
  	"registration_id" varchar,
  	"status" "enum_registrations_status" DEFAULT 'pending' NOT NULL,
  	"payment_status" "enum_registrations_payment_status" DEFAULT 'pending',
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "abstracts_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar
  );
  
  CREATE TABLE "abstracts_co_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"organization" varchar
  );
  
  CREATE TABLE "abstracts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"submission_id" varchar,
  	"title" varchar NOT NULL,
  	"abstract" varchar NOT NULL,
  	"track" "enum_abstracts_track" NOT NULL,
  	"primary_author_first_name" varchar NOT NULL,
  	"primary_author_last_name" varchar NOT NULL,
  	"primary_author_email" varchar NOT NULL,
  	"primary_author_phone" varchar,
  	"primary_author_organization" varchar NOT NULL,
  	"primary_author_country" varchar NOT NULL,
  	"abstract_file_id" integer,
  	"presentation_type" "enum_abstracts_presentation_type",
  	"status" "enum_abstracts_status" DEFAULT 'received' NOT NULL,
  	"reviewer_comments" varchar,
  	"assigned_session_id" integer,
  	"admin_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "speakers_type" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_speakers_type",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "speakers_expertise" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"area" varchar
  );
  
  CREATE TABLE "speakers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"organization" varchar NOT NULL,
  	"country" varchar NOT NULL,
  	"photo_id" integer NOT NULL,
  	"bio" jsonb NOT NULL,
  	"featured" boolean DEFAULT false,
  	"social_media_twitter" varchar,
  	"social_media_linkedin" varchar,
  	"social_media_website" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "speakers_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sessions_id" integer
  );
  
  CREATE TABLE "sessions_materials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"material_id" integer,
  	"description" varchar
  );
  
  CREATE TABLE "sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" jsonb NOT NULL,
  	"type" "enum_sessions_type" NOT NULL,
  	"track" "enum_sessions_track",
  	"date" timestamp(3) with time zone NOT NULL,
  	"start_time" timestamp(3) with time zone NOT NULL,
  	"end_time" timestamp(3) with time zone NOT NULL,
  	"venue" varchar NOT NULL,
  	"capacity" numeric,
  	"moderator_id" integer,
  	"requires_registration" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sessions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"speakers_id" integer,
  	"abstracts_id" integer
  );
  
  CREATE TABLE "resources_topics" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_resources_topics",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "resources_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"author" varchar
  );
  
  CREATE TABLE "resources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"file_id" integer NOT NULL,
  	"type" "enum_resources_type" NOT NULL,
  	"year" numeric NOT NULL,
  	"sarsyc_edition" "enum_resources_sarsyc_edition",
  	"country" varchar,
  	"language" "enum_resources_language" DEFAULT 'en',
  	"downloads" numeric DEFAULT 0,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "news_category" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_news_category",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "news_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"excerpt" varchar NOT NULL,
  	"content" jsonb NOT NULL,
  	"featured_image_id" integer NOT NULL,
  	"author_id" integer NOT NULL,
  	"status" "enum_news_status" DEFAULT 'draft' NOT NULL,
  	"published_date" timestamp(3) with time zone,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "partners_sarsyc_editions" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_partners_sarsyc_editions",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "partners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer NOT NULL,
  	"description" jsonb,
  	"type" "enum_partners_type" NOT NULL,
  	"tier" "enum_partners_tier",
  	"website" varchar,
  	"active" boolean DEFAULT true,
  	"display_order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" jsonb NOT NULL,
  	"category" "enum_faqs_category" NOT NULL,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"registrations_id" integer,
  	"abstracts_id" integer,
  	"speakers_id" integer,
  	"sessions_id" integer,
  	"resources_id" integer,
  	"news_id" integer,
  	"partners_id" integer,
  	"faqs_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"conference_name" varchar DEFAULT 'SARSYC VI',
  	"conference_theme" varchar DEFAULT 'Align for Action: Sustaining Progress in Youth Health and Education',
  	"conference_date" timestamp(3) with time zone NOT NULL,
  	"conference_end_date" timestamp(3) with time zone NOT NULL,
  	"conference_location" varchar DEFAULT 'Windhoek, Namibia',
  	"conference_venue" varchar,
  	"registration_open" boolean DEFAULT false,
  	"registration_open_date" timestamp(3) with time zone,
  	"early_bird_deadline" timestamp(3) with time zone,
  	"registration_close_date" timestamp(3) with time zone,
  	"abstracts_open" boolean DEFAULT false,
  	"abstract_deadline" timestamp(3) with time zone,
  	"contact_email" varchar NOT NULL,
  	"contact_phone" varchar,
  	"address" varchar,
  	"facebook" varchar,
  	"twitter" varchar,
  	"instagram" varchar,
  	"linkedin" varchar,
  	"youtube" varchar,
  	"site_title" varchar DEFAULT 'SARSYC VI - Southern African Regional Students and Youth Conference',
  	"site_description" varchar DEFAULT 'Join us for SARSYC VI in Windhoek, Namibia. The premier regional platform for youth health and education advocacy.',
  	"google_analytics_id" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_nav_items_sub_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link" varchar NOT NULL
  );
  
  CREATE TABLE "header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link" varchar NOT NULL
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer NOT NULL,
  	"cta_button_text" varchar DEFAULT 'Register Now',
  	"cta_button_link" varchar DEFAULT '/participate/register',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"description" varchar DEFAULT 'SARSYC is the premier regional platform for students and youth working on reproductive health advocacy in Southern Africa.',
  	"copyright" varchar DEFAULT '© 2026 SAYWHAT. All rights reserved.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "registrations_dietary_restrictions" ADD CONSTRAINT "registrations_dietary_restrictions_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."registrations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "abstracts_keywords" ADD CONSTRAINT "abstracts_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."abstracts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "abstracts_co_authors" ADD CONSTRAINT "abstracts_co_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."abstracts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "abstracts" ADD CONSTRAINT "abstracts_abstract_file_id_media_id_fk" FOREIGN KEY ("abstract_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "abstracts" ADD CONSTRAINT "abstracts_assigned_session_id_sessions_id_fk" FOREIGN KEY ("assigned_session_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "speakers_type" ADD CONSTRAINT "speakers_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."speakers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "speakers_expertise" ADD CONSTRAINT "speakers_expertise_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."speakers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "speakers" ADD CONSTRAINT "speakers_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "speakers_rels" ADD CONSTRAINT "speakers_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."speakers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "speakers_rels" ADD CONSTRAINT "speakers_rels_sessions_fk" FOREIGN KEY ("sessions_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sessions_materials" ADD CONSTRAINT "sessions_materials_material_id_media_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sessions_materials" ADD CONSTRAINT "sessions_materials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sessions" ADD CONSTRAINT "sessions_moderator_id_speakers_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."speakers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sessions_rels" ADD CONSTRAINT "sessions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sessions_rels" ADD CONSTRAINT "sessions_rels_speakers_fk" FOREIGN KEY ("speakers_id") REFERENCES "public"."speakers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sessions_rels" ADD CONSTRAINT "sessions_rels_abstracts_fk" FOREIGN KEY ("abstracts_id") REFERENCES "public"."abstracts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_topics" ADD CONSTRAINT "resources_topics_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources_authors" ADD CONSTRAINT "resources_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_category" ADD CONSTRAINT "news_category_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_tags" ADD CONSTRAINT "news_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news" ADD CONSTRAINT "news_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news" ADD CONSTRAINT "news_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_sarsyc_editions" ADD CONSTRAINT "partners_sarsyc_editions_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_registrations_fk" FOREIGN KEY ("registrations_id") REFERENCES "public"."registrations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_abstracts_fk" FOREIGN KEY ("abstracts_id") REFERENCES "public"."abstracts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_speakers_fk" FOREIGN KEY ("speakers_id") REFERENCES "public"."speakers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sessions_fk" FOREIGN KEY ("sessions_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_resources_fk" FOREIGN KEY ("resources_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items_sub_items" ADD CONSTRAINT "header_nav_items_sub_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header" ADD CONSTRAINT "header_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "registrations_dietary_restrictions_order_idx" ON "registrations_dietary_restrictions" USING btree ("order");
  CREATE INDEX "registrations_dietary_restrictions_parent_idx" ON "registrations_dietary_restrictions" USING btree ("parent_id");
  CREATE UNIQUE INDEX "registrations_email_idx" ON "registrations" USING btree ("email");
  CREATE UNIQUE INDEX "registrations_registration_id_idx" ON "registrations" USING btree ("registration_id");
  CREATE INDEX "registrations_updated_at_idx" ON "registrations" USING btree ("updated_at");
  CREATE INDEX "registrations_created_at_idx" ON "registrations" USING btree ("created_at");
  CREATE INDEX "abstracts_keywords_order_idx" ON "abstracts_keywords" USING btree ("_order");
  CREATE INDEX "abstracts_keywords_parent_id_idx" ON "abstracts_keywords" USING btree ("_parent_id");
  CREATE INDEX "abstracts_co_authors_order_idx" ON "abstracts_co_authors" USING btree ("_order");
  CREATE INDEX "abstracts_co_authors_parent_id_idx" ON "abstracts_co_authors" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "abstracts_submission_id_idx" ON "abstracts" USING btree ("submission_id");
  CREATE INDEX "abstracts_abstract_file_idx" ON "abstracts" USING btree ("abstract_file_id");
  CREATE INDEX "abstracts_assigned_session_idx" ON "abstracts" USING btree ("assigned_session_id");
  CREATE INDEX "abstracts_updated_at_idx" ON "abstracts" USING btree ("updated_at");
  CREATE INDEX "abstracts_created_at_idx" ON "abstracts" USING btree ("created_at");
  CREATE INDEX "speakers_type_order_idx" ON "speakers_type" USING btree ("order");
  CREATE INDEX "speakers_type_parent_idx" ON "speakers_type" USING btree ("parent_id");
  CREATE INDEX "speakers_expertise_order_idx" ON "speakers_expertise" USING btree ("_order");
  CREATE INDEX "speakers_expertise_parent_id_idx" ON "speakers_expertise" USING btree ("_parent_id");
  CREATE INDEX "speakers_photo_idx" ON "speakers" USING btree ("photo_id");
  CREATE INDEX "speakers_updated_at_idx" ON "speakers" USING btree ("updated_at");
  CREATE INDEX "speakers_created_at_idx" ON "speakers" USING btree ("created_at");
  CREATE INDEX "speakers_rels_order_idx" ON "speakers_rels" USING btree ("order");
  CREATE INDEX "speakers_rels_parent_idx" ON "speakers_rels" USING btree ("parent_id");
  CREATE INDEX "speakers_rels_path_idx" ON "speakers_rels" USING btree ("path");
  CREATE INDEX "speakers_rels_sessions_id_idx" ON "speakers_rels" USING btree ("sessions_id");
  CREATE INDEX "sessions_materials_order_idx" ON "sessions_materials" USING btree ("_order");
  CREATE INDEX "sessions_materials_parent_id_idx" ON "sessions_materials" USING btree ("_parent_id");
  CREATE INDEX "sessions_materials_material_idx" ON "sessions_materials" USING btree ("material_id");
  CREATE INDEX "sessions_moderator_idx" ON "sessions" USING btree ("moderator_id");
  CREATE INDEX "sessions_updated_at_idx" ON "sessions" USING btree ("updated_at");
  CREATE INDEX "sessions_created_at_idx" ON "sessions" USING btree ("created_at");
  CREATE INDEX "sessions_rels_order_idx" ON "sessions_rels" USING btree ("order");
  CREATE INDEX "sessions_rels_parent_idx" ON "sessions_rels" USING btree ("parent_id");
  CREATE INDEX "sessions_rels_path_idx" ON "sessions_rels" USING btree ("path");
  CREATE INDEX "sessions_rels_speakers_id_idx" ON "sessions_rels" USING btree ("speakers_id");
  CREATE INDEX "sessions_rels_abstracts_id_idx" ON "sessions_rels" USING btree ("abstracts_id");
  CREATE INDEX "resources_topics_order_idx" ON "resources_topics" USING btree ("order");
  CREATE INDEX "resources_topics_parent_idx" ON "resources_topics" USING btree ("parent_id");
  CREATE INDEX "resources_authors_order_idx" ON "resources_authors" USING btree ("_order");
  CREATE INDEX "resources_authors_parent_id_idx" ON "resources_authors" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "resources_slug_idx" ON "resources" USING btree ("slug");
  CREATE INDEX "resources_file_idx" ON "resources" USING btree ("file_id");
  CREATE INDEX "resources_updated_at_idx" ON "resources" USING btree ("updated_at");
  CREATE INDEX "resources_created_at_idx" ON "resources" USING btree ("created_at");
  CREATE INDEX "news_category_order_idx" ON "news_category" USING btree ("order");
  CREATE INDEX "news_category_parent_idx" ON "news_category" USING btree ("parent_id");
  CREATE INDEX "news_tags_order_idx" ON "news_tags" USING btree ("_order");
  CREATE INDEX "news_tags_parent_id_idx" ON "news_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "news_slug_idx" ON "news" USING btree ("slug");
  CREATE INDEX "news_featured_image_idx" ON "news" USING btree ("featured_image_id");
  CREATE INDEX "news_author_idx" ON "news" USING btree ("author_id");
  CREATE INDEX "news_updated_at_idx" ON "news" USING btree ("updated_at");
  CREATE INDEX "news_created_at_idx" ON "news" USING btree ("created_at");
  CREATE INDEX "partners_sarsyc_editions_order_idx" ON "partners_sarsyc_editions" USING btree ("order");
  CREATE INDEX "partners_sarsyc_editions_parent_idx" ON "partners_sarsyc_editions" USING btree ("parent_id");
  CREATE INDEX "partners_logo_idx" ON "partners" USING btree ("logo_id");
  CREATE INDEX "partners_updated_at_idx" ON "partners" USING btree ("updated_at");
  CREATE INDEX "partners_created_at_idx" ON "partners" USING btree ("created_at");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_registrations_id_idx" ON "payload_locked_documents_rels" USING btree ("registrations_id");
  CREATE INDEX "payload_locked_documents_rels_abstracts_id_idx" ON "payload_locked_documents_rels" USING btree ("abstracts_id");
  CREATE INDEX "payload_locked_documents_rels_speakers_id_idx" ON "payload_locked_documents_rels" USING btree ("speakers_id");
  CREATE INDEX "payload_locked_documents_rels_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("sessions_id");
  CREATE INDEX "payload_locked_documents_rels_resources_id_idx" ON "payload_locked_documents_rels" USING btree ("resources_id");
  CREATE INDEX "payload_locked_documents_rels_news_id_idx" ON "payload_locked_documents_rels" USING btree ("news_id");
  CREATE INDEX "payload_locked_documents_rels_partners_id_idx" ON "payload_locked_documents_rels" USING btree ("partners_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "header_nav_items_sub_items_order_idx" ON "header_nav_items_sub_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_sub_items_parent_id_idx" ON "header_nav_items_sub_items" USING btree ("_parent_id");
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE INDEX "header_logo_idx" ON "header" USING btree ("logo_id");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");