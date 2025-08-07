import {
	bigint,
	bigserial,
	boolean,
	pgTable,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { vehicle_actions } from "./vehicle_actions";
import { vehicles } from "./vehicles";

export const checkup_schedules = pgTable("checkup_schedules", {
	id: bigserial("id", { mode: "number" }).primaryKey(),
	date: timestamp("date").notNull(),
	vehicle_id: bigint("vehicle_id", { mode: "number" })
		.references(() => vehicles.id)
		.notNull(),
	vehicle_action_id: bigint("vehicle_action_id", { mode: "number" }).references(
		() => vehicle_actions.id,
	),
	status: varchar("status", { length: 255 }).notNull(),
	created_by: bigint("created_by", { mode: "number" })
		.references(() => users.id)
		.notNull(),
	created_at: timestamp("created_at").defaultNow().notNull(),
	modified_by: bigint("modified_by", { mode: "number" }).references(
		() => users.id,
	),
	modified_at: timestamp("modified_at"),
	is_complied: boolean("is_complied").default(false).notNull(),
	deleted: boolean("deleted").default(false).notNull(),
});
