import { pgTable, varchar, timestamp, bigserial, boolean, bigint } from "drizzle-orm/pg-core"
import { users } from "./users"
import { garages } from "./garages"
import { cities } from "./cities"

export const garage_addresses = pgTable('garage_addresses', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    garage_id: bigint('garage_id', { mode: 'number' }).references(() => garages.id).notNull(),
    type: varchar('type', { length: 255 }).notNull(),
    description: varchar('description', { length: 255 }),
    postal_code: bigint('postal_code', { mode: 'number' }).notNull(),
    street: varchar('street', { length: 255 }).notNull(),
    number: bigint('number', { mode: 'number' }).notNull(),
    neighbourhood: varchar('neighbourhood', { length: 255 }).notNull(),
    city_id: bigint('city_id', { mode: 'number' }).references(() => cities.id).notNull(),
    state: varchar('state', { length: 255 }).notNull(),
    region: varchar('region', { length: 255 }),
    created_at: timestamp('created_at').defaultNow().notNull(),
    modified_at: timestamp('modified_at'),
    created_by: bigint('created_by', { mode: 'number' }).references(() => users.id).notNull(),
    modified_by: bigint('modified_by', { mode: 'number' }).references(() => users.id).notNull(),
    deleted: boolean('deleted').default(false).notNull()
})