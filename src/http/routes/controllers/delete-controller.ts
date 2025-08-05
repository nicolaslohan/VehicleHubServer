import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { schema } from '../../../db/schema/index.ts'
import { db } from '../../../db/connection.ts'
import { eq, sql } from 'drizzle-orm'

export const deleteControllerRoute: FastifyPluginCallbackZod = (app) => {
    app.delete(
        '/controllers/:id',
        {
            schema: {
                summary: 'Desabilitar um controller',
                tags: ['Controllers'],
                params: z.object({
                    id: z.string()
                }),
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

                const deleteController = await db
                    .update(schema.controllers)
                    .set({
                        deleted: true,
                        modified_at: new Date()
                    })
                    .where(
                        sql`${schema.controllers.id} = ${id}`
                    )
                    .returning()

                const deletedController = deleteController[0]

                if (!deletedController) {
                    return reply.status(500).send({
                        message: 'Erro ao deletar controller.'
                    })
                }

                return reply.status(200).send({
                    message: 'Controller deletado com sucesso.'
                })
            } catch (err) {
                return reply.status(500).send({
                    message: 'Erro ao deletar controller.'
                })
            }

        }
    )
}