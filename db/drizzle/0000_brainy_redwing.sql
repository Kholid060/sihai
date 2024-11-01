CREATE TABLE IF NOT EXISTS "link_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"trigger" varchar(32),
	"target" varchar(500) DEFAULT '',
	"ref_path" varchar(500) DEFAULT '',
	"ref_domain" varchar(500) DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"link_id" text NOT NULL,
	"link_session_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "link_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"device" varchar(16) DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"os" varchar(32),
	"country" char(2),
	"browser" char(32),
	"language" char(16),
	"event" smallint DEFAULT 1,
	"link_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "links" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"clicks" integer DEFAULT 0,
	"archived" boolean DEFAULT false,
	"description" varchar(512) DEFAULT '' NOT NULL,
	"rules" json NOT NULL,
	"qr_opts" json NOT NULL,
	"utm_opts" json NOT NULL,
	"target" text NOT NULL,
	CONSTRAINT "links_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" varchar(64) NOT NULL,
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(128) DEFAULT 'free-plan' NOT NULL,
	"links_usage" integer DEFAULT 0 NOT NULL,
	"redirects_usage" integer DEFAULT 0 NOT NULL,
	"rules_limit" integer DEFAULT 3 NOT NULL,
	"links_limit" integer DEFAULT 15 NOT NULL,
	"redirects_limit" integer DEFAULT 500 NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"period_start" timestamp with time zone NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "link_events" ADD CONSTRAINT "link_events_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "link_events" ADD CONSTRAINT "link_events_link_session_id_link_sessions_id_fk" FOREIGN KEY ("link_session_id") REFERENCES "public"."link_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "link_sessions" ADD CONSTRAINT "link_sessions_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "links" ADD CONSTRAINT "links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_plans" ADD CONSTRAINT "user_plans_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "le_link_id" ON "link_events" USING btree ("link_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "le_created_at" ON "link_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "le_link_session_id" ON "link_events" USING btree ("link_session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "le_link_id_created" ON "link_events" USING btree ("link_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "le_link_id_ref_domain" ON "link_events" USING btree ("link_id","created_at","ref_domain");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "le_link_id_trigger" ON "link_events" USING btree ("link_id","created_at","trigger");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "le_link_id_target" ON "link_events" USING btree ("link_id","created_at","target");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ls_link_id" ON "link_sessions" USING btree ("link_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ls_created_at" ON "link_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ls_link_id_device" ON "link_sessions" USING btree ("link_id","created_at","device");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ls_link_id_os" ON "link_sessions" USING btree ("link_id","created_at","os");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ls_link_id_country" ON "link_sessions" USING btree ("link_id","created_at","country");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ls_link_id_browser" ON "link_sessions" USING btree ("link_id","created_at","browser");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ls_link_id_language" ON "link_sessions" USING btree ("link_id","created_at","language");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "l_user_id" ON "links" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "l_created_at" ON "links" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "l_title_search" ON "links" USING gin (to_tsvector('english', "title"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "uu_user_id_fk" ON "user_plans" USING btree ("user_id");