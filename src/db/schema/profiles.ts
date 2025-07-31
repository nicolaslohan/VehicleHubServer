import { pgTable, text, timestamp, bigserial, boolean, bigint } from 'drizzle-orm/pg-core'
import { users } from './users'

export const profiles = pgTable('profiles', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: text().unique().notNull(),
    created_by: bigint('created_by', { mode: 'number' }).references(() => users.id),
    modified_by: bigint('modified_by', { mode: 'number' }).references(() => users.id),
    created_at: timestamp().defaultNow().notNull(),
    modified_at: timestamp(),
    deleted: boolean().default(false).notNull()
})