CREATE TABLE "tables" (
	"table_id" varchar PRIMARY KEY NOT NULL,
	"capacity" integer NOT NULL,
	"location" varchar NOT NULL,
	"available" boolean DEFAULT true NOT NULL
);
