import {
	bigint,
	bigserial,
	boolean,
	pgTable,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { cost_centers } from "./cost_centers";
import { garages } from "./garages";
import { users } from "./users";
import { vehicle_contracts } from "./vehicle_contracts";
import { vehicle_models } from "./vehicle_models";

export const vehicles = pgTable("vehicles", {
	id: bigserial("id", { mode: "number" }).primaryKey(),
	plate: varchar("plate", { length: 255 }).unique().notNull(),
	milleage: bigint("milleage", { mode: "number" }).default(0).notNull(),
	vehicle_model_id: bigint("vehicle_model_id", { mode: "number" })
		.references(() => vehicle_models.id)
		.notNull(),
	cost_center_id: bigint("cost_center_id", { mode: "number" })
		.references(() => cost_centers.id)
		.notNull(),
	vehicle_contract_id: bigint("vehicle_contract_id", { mode: "number" })
		.references(() => vehicle_contracts.id)
		.notNull(),
	garage_id: bigint("garage_id", { mode: "number" })
		.references(() => garages.id)
		.notNull(),
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
