import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { db } from '../../../db/connection.ts'
import { schema } from '../../../db/schema/index.ts'
import { eq } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core/alias'
import { departmentsListResponse } from '@/@types/department-types.ts'
import z, { string, ZodError } from 'zod'

export const getDepartmentsRoute: FastifyPluginCallbackZod = (app) => {
    app.get('/departments',
        {
            schema: {
                summary: 'Listagem de todos os departamentos',
                tags: ['Departments'],
                response: {
                    200: departmentsListResponse,
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
                        id: schema.departments.id,
                        name: schema.departments.name,
                        created_at: schema.departments.created_at,
                        modified_at: schema.departments.modified_at,
                        created_by: {
                            id: created_by_user.id,
                            name: created_by_user.name,
                        },
                        modified_by: {
                            id: modified_by_user.id,
                            name: modified_by_user.name,
                        },
                        deleted: schema.departments.deleted,
                    })
                    .from(schema.departments)
                    .leftJoin(
                        created_by_user,
                        eq(created_by_user.id, schema.departments.created_by),
                    )
                    .leftJoin(
                        modified_by_user,
                        eq(modified_by_user.id, schema.departments.modified_by),
                    )
                    .orderBy(schema.departments.created_at)

                return reply.status(200).send(departmentsListResponse.parse(results))
            } catch (err) {
                if (err instanceof ZodError) {
                    return reply.status(400).send({ error: err.message })
                }
                return reply.status(500).send({ error: 'Internal server error' })
            }

        })
}