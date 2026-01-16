CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"preferences" varchar DEFAULT '',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tableId" uuid NOT NULL,
	"customerId" uuid NOT NULL,
	"date" date NOT NULL,
	"startTime" time NOT NULL,
	"endTime" time NOT NULL,
	"partySize" integer DEFAULT 2 NOT NULL,
	"status" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" varchar NOT NULL,
	"status" varchar NOT NULL,
	"capacity" integer DEFAULT 2 NOT NULL,
	"location" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_tableId_tables_id_fk" FOREIGN KEY ("tableId") REFERENCES "public"."tables"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_customerId_customers_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customer_email_index" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "reservation_table_id_index" ON "reservations" USING btree ("tableId");--> statement-breakpoint
CREATE INDEX "reservation_customer_id_index" ON "reservations" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "reservation_party_size_index" ON "reservations" USING btree ("partySize");--> statement-breakpoint
CREATE INDEX "reservation_status_index" ON "reservations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "table_number_index" ON "tables" USING btree ("number");--> statement-breakpoint
CREATE INDEX "table_capacity_index" ON "tables" USING btree ("capacity");--> statement-breakpoint
CREATE INDEX "table_status_index" ON "tables" USING btree ("status");