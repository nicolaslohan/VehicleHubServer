import {
	bigint,
	bigserial,
	boolean,
	pgTable,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const garages = pgTable("garages", {
	id: bigserial("id", { mode: "number" }).primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	description: varchar("description", { length: 255 }).notNull(),
	vacancies: bigint("vacancies", { mode: "number" }).notNull(),
	garage_address_id: bigint("address_id", { mode: "number" }).notNull(),
	created_at: timestamp("created_at").defaultNow().notNull(),
	modified_at: timestamp("modified_at"),
	created_by: bigint("created_by", { mode: "number" })
		.references(() => users.id)
		.notNull(),
	modified_by: bigint("modified_by", { mode: "number" }).references(
		() => users.id,
	),
	deleted: boolean("deleted").default(false).notNull(),
});
