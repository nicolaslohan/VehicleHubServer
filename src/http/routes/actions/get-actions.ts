import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { db } from '../../../db/connection.ts'
import { schema } from '../../../db/schema/index.ts'
import { alias } from 'drizzle-orm/pg-core/alias'
import { eq } from 'drizzle-orm'

export const getActionsRoute: FastifyPluginCallbackZod = (app) => {
    app.get('/actions', async () => {


        const modified_by_user = alias(schema.users, 'modified_by_user')
        const created_by_user = alias(schema.users, 'created_by_user')

        const results = await db
            .select({
                id: schema.actions.id,
                action: schema.actions.action,
                created_at: schema.actions.created_at,
                modified_at: schema.actions.modified_at,
                created_by: {
                    id: created_by_user.id,
                    name: created_by_user.name,
                },
                modified_by: {
                    id: modified_by_user.id,
                    name: modified_by_user.name,
                },
                deleted: schema.actions.deleted,
            })
            .from(schema.actions)
            .leftJoin(
                created_by_user,
                eq(created_by_user.id, schema.actions.created_by),
            )
            .leftJoin(
                modified_by_user,
                eq(modified_by_user.id, schema.actions.modified_by),
            )
            .orderBy(schema.actions.created_at)

        return results
    })
}