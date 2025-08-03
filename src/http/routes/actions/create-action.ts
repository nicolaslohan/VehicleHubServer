import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { schema } from '../../../db/schema/index.ts'
import { db } from '../../../db/connection.ts'
import { eq, sql } from 'drizzle-orm'

export const createActionRoute: FastifyPluginCallbackZod = (app) => {
    app.post(
        '/actions',
        {
            schema: {
                body: z.object({
                    action: z.string(),
                    created_by: z.number(),
                }),
            },
        },
        async (request, reply) => {
            const { action, created_by } = request.body

            const checkActionExists = await db
                .select({
                    id: schema.actions.action
                })
                .from(schema.actions)
                .where(
                    eq(schema.actions.action, action)
                )

            if (checkActionExists.length > 0) {
                return reply.status(409).send({
                    message: 'Já existe uma ação cadastrada com essa nomenclatura.'
                })
            }

            if (!created_by) {
                return reply.status(400).send({
                    message: 'Usuário não informado.'
                })
            }

            const checkUserExists = await db
                .select({
                    id: schema.users.id
                })
                .from(schema.users)
                .where(
                    sql`${schema.users.id} = ${created_by}`
                )

            if (!(checkUserExists.length > 0)) {
                return reply.status(404).send({
                    message: 'Usuário não encontrado.'
                })
            }

            const createData: any = {}

            createData.action = action
            createData.created_by = created_by

            const result = await db
                .insert(schema.actions)
                .values(createData)
                .returning()

            const insertedAction = result[0]

            if (!insertedAction) {
                throw new Error('Erro ao criar nova ação.')
            }

            return reply.status(201).send({
                actionId: insertedAction.id
            })
        }
    )
}