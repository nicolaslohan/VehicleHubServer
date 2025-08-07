import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod";

export const meRoute: FastifyPluginCallbackZod = (app) => {
	app.get(
		"/users/me",

		{
			schema: {
				summary: "Retorna dados do usuário logado.",
				tags: ["Auth"],
				response: {
					200: z.object({ user: z.any() }),
				},
			},
			preHandler: [app.authenticate],
		},

		async (request, reply) => {
			reply.send({ user: request.user });
		},
	);
};
