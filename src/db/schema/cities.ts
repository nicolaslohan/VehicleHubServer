import { bigint, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const cities = pgTable("cities", {
	id: bigint("id", { mode: "number" }).primaryKey(),
	city_name: varchar("city_name", { length: 255 }).notNull(),
	state: varchar("state", { length: 255 }).notNull(),
	state_acronym: varchar("state_acronym", { length: 255 }),
	region: varchar("region", { length: 255 }),
	created_at: timestamp("created_at").defaultNow().notNull(),
	modified_at: timestamp("modified_at"),
});
