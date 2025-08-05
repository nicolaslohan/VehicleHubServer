import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { schema } from '../../../db/schema/index.ts'
import { db } from '../../../db/connection.ts'
import { eq, sql } from 'drizzle-orm'

export const deleteActionRoute: FastifyPluginCallbackZod = (app) => {
    app.delete(
        '/actions/:id',
        {
            schema: {
                summary: 'Deleta uma ação',
                tags: ['Actions'],
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
            const { id } = request.params

            const checkActionsExists = await db
                .select({
                    id: schema.actions.id
                })
                .from(schema.actions)
                .where(
                    sql`${schema.actions.id} = ${id}`
                )

            if (!(checkActionsExists.length > 0)) {
                return reply.status(404).send({
                    message: 'Ação não encontrado.'
                })
            }

            const deleteAction = await db
                .update(schema.actions)
                .set({
                    deleted: true,
                    modified_at: new Date()
                })
                .where(
                    sql`${schema.actions.id} = ${id}`
                )
                .returning()

            const deletedAction = deleteAction[0]

            if (!deletedAction) {
                return reply.status(500).send({
                    message: 'Erro ao deletar ação.'
                })
            }

            return reply.status(200).send({
                message: 'Ação deletada com sucesso.'
            })
        }
    )
}