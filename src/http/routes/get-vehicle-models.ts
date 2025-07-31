import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { getAllModels } from '@/services/vehicles-api.ts'

export const getAllModelsRoute: FastifyPluginCallbackZod = async (app) => {
    app.get('/models', async (request, reply) => {
        const results = await getAllModels()
        return reply.status(200).send({ results })
    })
}