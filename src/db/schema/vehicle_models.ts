import { pgTable, varchar, timestamp, bigserial, boolean, bigint } from 'drizzle-orm/pg-core'
import { users } from './users'

export const vehicle_models = pgTable('vehicle_models', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    model: varchar('name', { length: 255 }).notNull(),
    make: varchar('make', { length: 255 }).notNull(),
    year: bigint('year', { mode: 'number' }).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    modified_at: timestamp('modified_at'),
    created_by: bigint('created_by', { mode: 'number' }).references(() => users.id).notNull(),
    modified_by: bigint('modified_by', { mode: 'number' }).references(() => users.id),
    deleted: boolean('deleted').default(false).notNull()
})