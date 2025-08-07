import {
	bigint,
	bigserial,
	boolean,
	pgTable,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { cities } from "./cities";
import { companies } from "./companies";

export const company_addresses = pgTable("company_addresses", {
	id: bigserial("id", { mode: "number" }).primaryKey(),
	company_id: bigint("company_id", { mode: "number" })
		.references(() => companies.id)
		.notNull(),
	type: varchar("type", { length: 255 }).notNull(),
	description: varchar("description", { length: 255 }),
	postal_code: bigint("postal_code", { mode: "number" }).notNull(),
	street: varchar("street", { length: 255 }).notNull(),
	complement: varchar("complement", { length: 255 }),
	reference: varchar("reference", { length: 255 }),
	number: bigint("number", { mode: "number" }).notNull(),
	neighbourhood: varchar("neighbourhood", { length: 255 }).notNull(),
	city_id: bigint("city_id", { mode: "number" })
		.references(() => cities.id)
		.notNull(),
	state: varchar("state", { length: 255 }).notNull(),
	region: varchar("region", { length: 255 }),
	created_at: timestamp("created_at").defaultNow().notNull(),
	modified_at: timestamp("modified_at"),
	created_by: bigint("created_by", { mode: "number" }).notNull(),
	modified_by: bigint("modified_by", { mode: "number" }).notNull(),
	deleted: boolean("deleted").default(false).notNull(),
});
