import {
	bigint,
	bigserial,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const logs = pgTable("logs", {
	id: bigserial("id", { mode: "number" }).primaryKey(),
	user_id: bigint("user_id", { mode: "number" }).references(() => users.id),
	description: text("description").notNull(),
	created_at: timestamp("created_at").defaultNow().notNull(),
});
