import fastifyJwt from "@fastify/jwt";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

interface JwtPluginOptions {
	secret: string;
}

const jwtPlugin: FastifyPluginAsync<JwtPluginOptions> = async (
	fastify,
	opts,
) => {
	fastify.register(fastifyJwt, {
		secret: opts.secret,
		sign: { expiresIn: "30m" },
	});

	fastify.decorate("authenticate", async (request: any, reply: any) => {
		try {
			await request.jwtVerify();
		} catch (err) {
			return reply.status(401).send({ error: "Unauthorized" });
		}
	});
};

export default fp(jwtPlugin);
