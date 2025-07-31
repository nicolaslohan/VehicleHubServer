import { pgTable, varchar, timestamp, bigserial, boolean, bigint } from 'drizzle-orm/pg-core'
import { users } from './users'
import { departments } from './departments'

export const cost_centers = pgTable('cost_centers', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 255 }),
    department_id: bigint('department_id', { mode: 'number' }).references(() => departments.id),
    created_at: timestamp('created_at').defaultNow().notNull(),
    modified_at: timestamp('modified_at'),
    created_by: bigint('created_by', { mode: 'number' }).references(() => users.id).notNull(),
    modified_by: bigint('modified_by', { mode: 'number' }).references(() => users.id),
    deleted: boolean('deleted').default(false).notNull()
})