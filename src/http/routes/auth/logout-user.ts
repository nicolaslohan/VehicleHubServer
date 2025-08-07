import { eq } from "drizzle-orm";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "@/db/connection";
import { schema } from "@/db/schema";

export const logoutRoute: FastifyPluginCallbackZod = (app) => {
	app.post(
		"/users/logout",
		{
			schema: {
				summary: "Realiza o logout do usuário.",
				tags: ["Auth"],
				response: {
					200: z.object({ message: z.string() }),
					401: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const refreshToken = request.cookies.refreshToken;

			if (refreshToken) {
				await db
					.delete(schema.refreshTokens)
					.where(eq(schema.refreshTokens.token, refreshToken));
			} else {
				return reply.status(401).send({ message: "Não há usuário logado." });
			}

			reply.clearCookie("refreshToken", { path: "/users/refresh" });
			return reply
				.status(200)
				.send({ message: "Logout realizado com sucesso!" });
		},
	);
};
