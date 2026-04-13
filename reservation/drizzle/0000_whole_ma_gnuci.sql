CREATE TYPE "public"."status_type" AS ENUM('confirmed', 'waitlisted', 'canceled');--> statement-breakpoint
CREATE TABLE "customers" (
	"customer_id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"reservation_id" varchar PRIMARY KEY NOT NULL,
	"table_id" varchar NOT NULL,
	"customer_id" varchar NOT NULL,
	"status" "status_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlists" (
	"table_id" varchar NOT NULL,
	"customer_id" varchar NOT NULL,
	"preferences" text[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_customer_id_customers_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("customer_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlists" ADD CONSTRAINT "waitlists_customer_id_customers_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("customer_id") ON DELETE no action ON UPDATE no action;