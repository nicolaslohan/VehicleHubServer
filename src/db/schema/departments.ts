import { pgTable, timestamp, bigserial, boolean, bigint, varchar } from 'drizzle-orm/pg-core'
import { users } from './users'

export const departments = pgTable('departments', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    modified_at: timestamp('modified_at'),
    created_by: bigint('created_by', { mode: 'number' }).references(() => users.id).notNull(),
    modified_by: bigint('modified_by', { mode: 'number' }).references(() => users.id),
    deleted: boolean('deleted').default(false).notNull()
})