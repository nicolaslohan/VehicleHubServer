import fp from 'fastify-plugin';

export default fp(async (fastify) => {
    fastify.register(require('@fastify/jwt'), {
        secret: process.env.JWT_SECRET!,
        expires_in: '30m'
    });

    fastify.decorate("authenticate", async (request: any, reply: any) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });
});

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: any;
    }
}
