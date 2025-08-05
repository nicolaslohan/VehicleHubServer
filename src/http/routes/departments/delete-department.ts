import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { schema } from '@/db/schema/index.ts'
import { db } from '@/db/connection.ts'
import { eq, sql } from 'drizzle-orm'

export const deleteDepartmentRoute: FastifyPluginCallbackZod = (app) => {
    app.delete(
        '/departments/:id',
        {
            schema: {
                summary: 'Desabilitar um departamento',
                tags: ['Departments'],
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

            const checkCostCenterExists = await db
                .select({
                    id: schema.departments.id
                })
                .from(schema.departments)
                .where(
                    sql`${schema.departments.id} = ${id}`
                )

            if (!(checkCostCenterExists.length > 0)) {
                return reply.status(404).send({
                    message: 'Departamento não encontrado.'
                })
            }

            const deleteDepartment = await db
                .update(schema.departments)
                .set({
                    deleted: true,
                    modified_at: new Date()
                })
                .where(
                    sql`${schema.departments.id} = ${id}`
                )
                .returning()

            const deletedDepartment = deleteDepartment[0]

            if (!deletedDepartment) {
                return reply.status(500).send({
                    message: 'Erro ao deletar departamento.'
                })
            }

            return reply.status(200).send({
                message: 'Departamento deletado com sucesso.'
            })
        }
    )
}