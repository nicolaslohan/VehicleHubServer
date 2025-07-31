import { pgTable, timestamp, bigserial, boolean, bigint } from 'drizzle-orm/pg-core'
import { profiles } from './profiles.ts'
import { controllers } from './controllers.ts'
import { actions } from './actions.ts'

export const profile_permissions = pgTable('profile_permissions', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    profile_id: bigint('profile_id', { mode: 'number' }).references(() => profiles.id),
    controller_id: bigint('controller_id', { mode: 'number' }).references(() => controllers.id),
    action_id: bigint('action_id', { mode: 'number' }).references(() => actions.id),
    permission: boolean('permission').default(true).notNull()
})