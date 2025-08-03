import { pgTable, timestamp, bigserial, boolean, bigint, text } from 'drizzle-orm/pg-core'
import { users } from './users'

export const refreshTokens = pgTable("refresh_tokens", {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    user_id: bigint("user_id", { mode: "number" }).references(() => users.id).notNull(),
    token: text("token").notNull(),
    revoked: boolean("revoked").default(false).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    expires_at: timestamp("expires_at").notNull(),
});