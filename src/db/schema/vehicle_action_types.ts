import {
	bigint,
	bigserial,
	boolean,
	jsonb,
	pgTable,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const vehicle_action_types = pgTable("vehicle_action_types", {
	id: bigserial("id", { mode: "number" }).primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	checklist_template: jsonb(),
	created_by: bigint("created_by", { mode: "number" })
		.references(() => users.id)
		.notNull(),
	modified_by: bigint("modified_by", { mode: "number" }).references(
		() => users.id,
	),
	created_at: timestamp("created_at").defaultNow().notNull(),
	modified_at: timestamp("modified_at"),
	deleted: boolean("deleted").default(false).notNull(),
});
