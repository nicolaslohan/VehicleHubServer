import {
	bigint,
	bigserial,
	boolean,
	numeric,
	pgTable,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { companies } from "./companies";

export const vehicle_contracts = pgTable("vehicle_contracts", {
	id: bigserial("id", { mode: "number" }).primaryKey(),
	company_id: bigint("company_id", { mode: "number" })
		.references(() => companies.id)
		.notNull(),
	milleage_limit: bigint("milleage_limit", { mode: "number" }).notNull(),
	contract_total_amount: numeric("contract_total_amount", {
		precision: 10,
		scale: 2,
	}).notNull(),
	tax_amount: numeric("tax_amount", { precision: 10, scale: 2 }).notNull(),
	start_date: timestamp("start_date").notNull(),
	end_date: timestamp("end_date").notNull(),
	created_at: timestamp("created_at").defaultNow().notNull(),
	modified_at: timestamp("modified_at"),
	created_by: bigint("created_by", { mode: "number" }).notNull(),
	modified_by: bigint("modified_by", { mode: "number" }).notNull(),
	deleted: boolean("deleted").default(false).notNull(),
});
