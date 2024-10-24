CREATE TABLE IF NOT EXISTS "links" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(128) DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"clicks" integer DEFAULT 0,
	"archived" boolean DEFAULT false,
	"description" varchar(512) DEFAULT '',
	"rules" json,
	"qr_opts" json,
	"utm_opts" json,
	"target" text NOT NULL,
	CONSTRAINT "links_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_usages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"period_start" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "plans" ALTER COLUMN "max_url" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "plans" ALTER COLUMN "max_redirect" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "max_rules" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "links" ADD CONSTRAINT "links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_usages" ADD CONSTRAINT "user_usages_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "l_user_id" ON "links" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "l_created_at" ON "links" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "uu_user_id_fk" ON "user_usages" USING btree ("user_id");