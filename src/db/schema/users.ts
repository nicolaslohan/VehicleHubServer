import { pgTable, text, timestamp, bigserial } from 'drizzle-orm/pg-core'
import { email } from 'zod'

export const users = pgTable('users', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: text().notNull(),
    email: text().unique().notNull(),
    password: text().notNull(),
    created_at: timestamp().defaultNow().notNull(),
    updated_at: timestamp().defaultNow(),
})