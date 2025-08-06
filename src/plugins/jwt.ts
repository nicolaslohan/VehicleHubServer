import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import fastifyJwt from '@fastify/jwt';

interface JwtPluginOptions {
    secret: string;
}

const jwtPlugin: FastifyPluginAsync<JwtPluginOptions> = async (fastify, opts) => {
    fastify.register(fastifyJwt, {
        secret: opts.secret,
        sign: { expiresIn: '30m' },
    });

    fastify.decorate("authenticate", async (request: any, reply: any) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });
};

export default fp(jwtPlugin);
