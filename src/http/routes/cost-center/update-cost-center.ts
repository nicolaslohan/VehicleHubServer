import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { schema } from '@/db/schema/index.ts'
import { db } from '@/db/connection.ts'
import { eq, sql } from 'drizzle-orm'
import { updateCostCentersParams } from '@/types/cost-center-types.ts'

export const updateCostCenterRoute: FastifyPluginCallbackZod = (app) => {
    app.put(
        '/cost-centers/:id',
        {
            schema: {
                summary: 'Alterar um centro de custo',
                tags: ['Cost Centers'],
                params: z.object({
                    id: z.string()
                }),
                body: updateCostCentersParams,
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
                const { name, description, department_id, modified_by } = request.body

                const checkCostCenterExists = await db
                    .select({
                        id: schema.cost_centers.id
                    })
                    .from(schema.cost_centers)
                    .where(
                        sql`${schema.cost_centers.id} = ${id}`
                    )

                if (!(checkCostCenterExists.length > 0)) {
                    return reply.status(404).send({
                        message: 'Centro de custo não encontrado.'
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

                if (name) updateData.name = name
                if (description) updateData.description = description
                if (department_id) updateData.department_id = department_id
                updateData.modified_by = modified_by

                const updateCostCenter = await db
                    .update(schema.cost_centers)
                    .set(updateData)
                    .where(
                        sql`${schema.cost_centers.id} = ${id}`
                    )
                    .returning()

                const updatedCostCenter = updateCostCenter[0]

                if (!updatedCostCenter) {
                    return reply.status(500).send({
                        message: 'Erro ao alterar centro de custo.'
                    })
                }

                return reply.status(200).send({
                    message: 'Centro de custo alterado com sucesso.'
                })
            } catch (err) {
                return reply.status(500).send({
                    message: 'Erro ao alterar centro de custo.'
                })
            }
        }
    )
}