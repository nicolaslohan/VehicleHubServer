import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { schema } from '../../../db/schema/index.ts'
import { db } from '../../../db/connection.ts'
import { eq } from 'drizzle-orm'
import { hashPassword } from '../../../services/hash.ts'

export const createUserRoute: FastifyPluginCallbackZod = (app) => {
    app.post(
        '/users',
        {
            schema: {
                body: z.object({
                    email: z.string().email(),
                    name: z.string(),
                    password: z.string().optional(),
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
                return reply.status(409).send({
                    message: 'Já existe um usuário com este e-mail cadastrado.'
                })
            }

            const createData: any = {}

            createData.email = email
            createData.name = name


            if (password) {
                const hashedPassword = await hashPassword(password)
                createData.password = hashedPassword
            } else {
                const hashedPassword = await hashPassword('12345678')
                createData.password = hashedPassword
            }


            const result = await db
                .insert(schema.users)
                .values(createData)
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