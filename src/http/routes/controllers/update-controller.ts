import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { schema } from '@/db/schema/index.ts'
import { db } from '@/db/connection.ts'
import { eq, sql } from 'drizzle-orm'
import { updateControllerParams } from '@/types/controllers-types.ts'

export const updateControllerRoute: FastifyPluginCallbackZod = (app) => {
    app.put(
        '/controllers/:id',
        {
            schema: {
                summary: 'Alterar um controller',
                tags: ['Controllers'],
                params: z.object({
                    id: z.string()
                }),
                body: updateControllerParams,
                response: {
                    200: z.object({
                        message: z.string()
                    }),
                    404: z.object({
                        message: z.string()
                    }),
                    500: z.object({
                        message: z.string()
                    })
                }
            }
        },
        async (request, reply) => {
            try {
                const { id } = request.params
                const { controller, modified_by } = request.body

                const checkControllerExists = await db
                    .select({
                        id: schema.controllers.id
                    })
                    .from(schema.controllers)
                    .where(
                        sql`${schema.controllers.id} = ${id}`
                    )

                if (!(checkControllerExists.length > 0)) {
                    return reply.status(404).send({
                        message: 'Controller não encontrado.'
                    })
                }

                const checkUserExists = await db
                    .select({
                        id: schema.users.id
                    })
                    .from(schema.users)
                    .where(
                        sql`${schema.users.id} = ${modified_by}`
                    )

                if (!(checkUserExists.length > 0)) {
                    return reply.status(404).send({
                        message: 'Usuário não encontrado.'
                    })
                }

                const updateData: any = {}

                updateData.controller = controller
                updateData.modified_by = modified_by

                const updateController = await db
                    .update(schema.controllers)
                    .set(updateData)
                    .where(
                        sql`${schema.controllers.id} = ${id}`
                    )
                    .returning()

                const updatedController = updateController[0]

                if (!updatedController) {
                    return reply.status(500).send({
                        message: 'Erro ao alterar controller.'
                    })
                }

                return reply.status(200).send({
                    message: 'Controller alterado com sucesso.'
                })
            } catch (err) {
                return reply.status(500).send({
                    message: 'Erro ao alterar controller.'
                })
            }
        }
    )
}