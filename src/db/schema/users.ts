import { pgTable, text, timestamp, bigserial, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: text().notNull(),
    email: text().unique().notNull(),
    password: text().notNull(),
    first_access: boolean().default(true).notNull(),
    profile_id: bigserial('profile_id', { mode: 'number' }).notNull(),
    created_at: timestamp().defaultNow().notNull(),
    updated_at: timestamp().defaultNow(),
    deleted: boolean().default(false).notNull()
})

