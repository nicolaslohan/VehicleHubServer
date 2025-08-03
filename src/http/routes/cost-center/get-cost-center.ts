import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { db } from '../../../db/connection.ts'
import { schema } from '../../../db/schema/index.ts'
import { alias } from 'drizzle-orm/pg-core/alias'
import { eq } from 'drizzle-orm'
import { costCenterResponse } from '@/@types/cost-center-types.ts'
import z, { ZodError } from 'zod'

export const getCostCenterRoute: FastifyPluginCallbackZod = (app) => {
    app.get('/cost_centers',
        {
            schema: {
                summary: 'Listagem de todos os centros de custo',
                tags: ['Cost Centers'],
                response: {
                    200: costCenterResponse,
                    400: z.object({ error: z.string() }),
                    500: z.object({ error: z.string() }),
                }
            }
        },
        async (request, reply) => {

            try {
                const modified_by_user = alias(schema.users, 'modified_by_user')
                const created_by_user = alias(schema.users, 'created_by_user')

                const results = await db
                    .select({
                        id: schema.cost_centers.id,
                        name: schema.cost_centers.name,
                        created_at: schema.cost_centers.created_at,
                        modified_at: schema.cost_centers.modified_at,
                        created_by: {
                            id: created_by_user.id,
                            name: created_by_user.name,
                        },
                        modified_by: {
                            id: modified_by_user.id,
                            name: modified_by_user.name,
                        },
                        deleted: schema.cost_centers.deleted,
                    })
                    .from(schema.cost_centers)
                    .leftJoin(
                        created_by_user,
                        eq(created_by_user.id, schema.cost_centers.created_by),
                    )
                    .leftJoin(
                        modified_by_user,
                        eq(modified_by_user.id, schema.cost_centers.modified_by),
                    )
                    .orderBy(schema.cost_centers.created_at)

                return reply.status(200).send(costCenterResponse.parse(results))
            } catch (err) {
                if (err instanceof ZodError) {
                    return reply.status(400).send({ error: err.message })
                }
                return reply.status(500).send({ error: 'Internal server error' })
            }

        })
}