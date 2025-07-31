import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { schema } from '../../../db/schema/index.ts'
import { db } from '../../../db/connection.ts'
import { eq, sql } from 'drizzle-orm'

export const deleteUserRoute: FastifyPluginCallbackZod = (app) => {
    app.delete(
        '/users/:id',
        {
            schema: {
                params: z.object({
                    id: z.string()
                })
            }
        },
        async (request, reply) => {
            const { id } = request.params

            const checkUserExists = await db
                .select({
                    id: schema.users.id
                })
                .from(schema.users)
                .where(
                    sql`${schema.users.id} = ${id}`
                )

            if (!(checkUserExists.length > 0)) {
                return reply.status(404).send({
                    message: 'Usuário não encontrado.'
                })
            }

            const deleteUser = await db
                .update(schema.users)
                .set({
                    deleted: true,
                    updated_at: new Date()
                })
                .where(
                    sql`${schema.users.id} = ${id}`
                )
                .returning()

            const deletedUser = deleteUser[0]

            if (!deletedUser) {
                return reply.status(500).send({
                    message: 'Erro ao deletar usuário.'
                })
            }

            return reply.status(200).send({
                message: 'Usuário deletado com sucesso.'
            })
        }
    )
}