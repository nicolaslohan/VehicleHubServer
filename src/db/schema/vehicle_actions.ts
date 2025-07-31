import { pgTable, timestamp, bigserial, boolean, bigint, jsonb } from 'drizzle-orm/pg-core'
import { vehicle_action_types } from './vehicle_action_types'
import { users } from './users'

export const vehicle_actions = pgTable('vehicle_actions', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    vehicle_id: bigint('vehicle_id', { mode: 'number' }).notNull(),
    user_id: bigint('user_id', { mode: 'number' }).references(() => users.id).notNull(),
    vehicle_action_type_id: bigint('vehicle_action_type_id', { mode: 'number' }).references(() => vehicle_action_types.id).notNull(),
    milleage: bigint('milleage', { mode: 'number' }).notNull(),
    checklist: jsonb('checklist'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    modified_at: timestamp('modified_at'),
    modified_by: bigint('modified_by', { mode: 'number' }).references(() => users.id),
    deleted: boolean('deleted').default(false).notNull()
})