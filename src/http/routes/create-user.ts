import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { schema } from '../../db/schema/index.ts'
import { db } from '../../db/connection.ts'
import { eq } from 'drizzle-orm'

export const createUserRoute: FastifyPluginCallbackZod = (app) => {
    app.post(
        '/users',
        {
            schema: {
                body: z.object({
                    email: z.string(),
                    name: z.string(),
                    password: z.string(),
                }),
            },
        },
        async (request, reply) => {
            const { email, name, password } = request.body

            const checkUserExists = await db
                .select({
                    id: schema.users.id
                })
                .from(schema.users)
                .where(
                    eq(schema.users.email, email)
                )

            if (checkUserExists.length > 0) {
                throw new Error('O usuário já existe.')
            }

            const result = await db
                .insert(schema.users)
                .values({ email, name, password })
                .returning()

            const insertedUser = result[0]

            if (!insertedUser) {
                throw new Error('Erro ao criar novo usuário.')
            }

            return reply.status(201).send({
                userId: insertedUser.id
            })
        }
    )
}