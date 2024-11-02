DROP INDEX IF EXISTS "le_link_session_id";--> statement-breakpoint
DROP INDEX IF EXISTS "le_link_id_created";--> statement-breakpoint
DROP INDEX IF EXISTS "le_link_id_ref_domain";--> statement-breakpoint
DROP INDEX IF EXISTS "le_link_id_trigger";--> statement-breakpoint
DROP INDEX IF EXISTS "le_link_id_target";--> statement-breakpoint
DROP INDEX IF EXISTS "ls_link_id_device";--> statement-breakpoint
DROP INDEX IF EXISTS "ls_link_id_os";--> statement-breakpoint
DROP INDEX IF EXISTS "ls_link_id_country";--> statement-breakpoint
DROP INDEX IF EXISTS "ls_link_id_browser";--> statement-breakpoint
DROP INDEX IF EXISTS "ls_link_id_language";--> statement-breakpoint
ALTER TABLE "link_events" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "link_sessions" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "link_events" ADD CONSTRAINT "link_events_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "link_sessions" ADD CONSTRAINT "link_sessions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "le_user_id" ON "link_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "le_created_at_ref_domain" ON "link_events" USING btree ("user_id","created_at","ref_domain");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "le_created_at_trigger" ON "link_events" USING btree ("user_id","created_at","trigger");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "le_created_at_target" ON "link_events" USING btree ("user_id","created_at","target");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id" ON "link_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ls_created_at_device" ON "link_sessions" USING btree ("user_id","created_at","device");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ls_created_at_os" ON "link_sessions" USING btree ("created_at","os");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ls_created_at_country" ON "link_sessions" USING btree ("user_id","created_at","country");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ls_created_at_browser" ON "link_sessions" USING btree ("user_id","created_at","browser");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ls_created_at_language" ON "link_sessions" USING btree ("user_id","created_at","language");