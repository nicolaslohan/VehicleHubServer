import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { schema } from '@/db/schema/index.ts'
import { db } from '@/db/connection.ts'
import { eq, sql } from 'drizzle-orm'

export const deleteCostCenterRoute: FastifyPluginCallbackZod = (app) => {
    app.delete(
        '/cost_centers/:id',
        {
            schema: {
                summary: 'Desabilitar um centro de custo',
                tags: ['Cost Centers'],
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

                const deleteCostCenter = await db
                    .update(schema.cost_centers)
                    .set({
                        deleted: true,
                        modified_at: new Date()
                    })
                    .where(
                        sql`${schema.cost_centers.id} = ${id}`
                    )
                    .returning()

                const deletedCostCenter = deleteCostCenter[0]

                if (!deletedCostCenter) {
                    return reply.status(500).send({
                        message: 'Erro ao deletar centro de custo.'
                    })
                }

                return reply.status(200).send({
                    message: 'Centro de custo deletado com sucesso.'
                })
            } catch (err) {
                return reply.status(500).send({
                    message: 'Erro ao deletar centro de custo.'
                })
            }

        }
    )
}