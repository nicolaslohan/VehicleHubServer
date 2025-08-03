import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { db } from '../../../db/connection.ts'
import { schema } from '../../../db/schema/index.ts'
import { eq, sql } from 'drizzle-orm'
import { hashPassword, verifyPassword } from '@/services/hash.ts'
import z from 'zod'

export const updateUserRoute: FastifyPluginCallbackZod = (app) => {
    app.put(
        '/users/:id',
        {
            schema: {
                summary: 'Atualizar um usuário',
                tags: ['Users'],
                params: z.object({
                    id: z.string()
                }),
                body: z.object({
                    name: z.string().optional(),
                    email: z.string().email().optional(),
                    first_access: z.boolean().optional(),
                    new_password: z.string().optional(),
                    new_password_confirmation: z.string().optional(),
                    current_password: z.string(),

                }),
                response: {
                    200: z.object({
                        message: z.string()
                    }),
                    400: z.object({
                        message: z.string()
                    }),
                    401: z.object({
                        message: z.string()
                    }),
                    404: z.object({
                        message: z.string()
                    }),
                    500: z.object({
                        message: z.string()
                    })
                }
            },
        },
        async (request, reply) => {
            const { id } = request.params
            const { email, name, first_access, new_password, new_password_confirmation, current_password } = request.body

            const updateData: any = {}

            if (name !== undefined) updateData.name = name
            if (email !== undefined) updateData.email = email
            if (new_password !== undefined) {

                const hashedPassword = await hashPassword(new_password)
                updateData.password = hashedPassword
            }
            if (first_access !== undefined) updateData.first_access = first_access

            updateData.updated_at = new Date()

            const checkUserExists = await db
                .select({
                    id: schema.users.id,
                    name: schema.users.name,
                    email: schema.users.email,
                    password: schema.users.password,
                    first_access: schema.users.first_access
                })
                .from(schema.users)
                .where(
                    sql`${schema.users.id} = ${id}`
                )

            // Se não existir usuário com o id informado
            if (!(checkUserExists.length > 0)) {
                return reply.status(404).send({
                    message: 'Usuário não encontrado.'
                })
            }

            // Se a verificação de nova senha for diferente
            if (new_password && new_password_confirmation) {
                if (new_password !== new_password_confirmation) {
                    return reply.status(400).send({
                        message: 'As senhas não conferem.'
                    })
                }

            }
            // Se não, se a senha atual for diferente da senha já cadastrada
            if (!(await verifyPassword(current_password, checkUserExists[0].password))) {
                return reply.status(401).send({
                    message: 'Senha atual incorreta.'
                })
            }

            if (new_password && (await verifyPassword(new_password, checkUserExists[0].password))) {
                return reply.status(400).send({
                    message: 'A nova senha não pode ser igual a senha atual.'
                })
            }

            const updateUser = await db
                .update(schema.users)
                .set(updateData)
                .where(
                    sql`${schema.users.id} = ${id}`
                )
                .returning()

            const updatedUser = updateUser[0]

            if (!updatedUser) {
                return reply.status(500).send({
                    message: 'Erro ao atualizar usuário.'
                })
            }

            return reply.status(200).send({
                message: 'Usuário atualizado com sucesso.'
            })
        }
    )
}