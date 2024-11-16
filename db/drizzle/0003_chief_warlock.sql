ALTER TABLE "link_events" DROP CONSTRAINT "link_events_user_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "link_events" DROP CONSTRAINT "link_events_link_id_links_id_fk";
--> statement-breakpoint
ALTER TABLE "link_sessions" DROP CONSTRAINT "link_sessions_user_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "link_sessions" DROP CONSTRAINT "link_sessions_link_id_links_id_fk";
--> statement-breakpoint
ALTER TABLE "user_plans" ALTER COLUMN "name" SET DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "user_plans" ALTER COLUMN "links_limit" SET DEFAULT 10;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "exp_url" text;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "exp_date" timestamp with time zone;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "link_events" ADD CONSTRAINT "link_events_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "link_events" ADD CONSTRAINT "link_events_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "link_sessions" ADD CONSTRAINT "link_sessions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "link_sessions" ADD CONSTRAINT "link_sessions_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
