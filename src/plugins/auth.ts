import type { FastifyPluginAsync } from 'fastify';

export const authPlugin: FastifyPluginAsync = async (app) => {
  app.decorate('authenticate', async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  });
};
