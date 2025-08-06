import { db } from "@/db/connection";
import { schema } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod";

export const logoutRoute: FastifyPluginCallbackZod = (app) => {
    app.post('/users/logout',
        {
            schema: {
                summary: 'Realiza o logout do usuário.',
                tags: ['Auth'],
                response: {
                    200: z.object({ message: z.string() }),
                },
            }
        },
        async (request, reply) => {
            const refreshToken = request.cookies.refreshToken;
            if (refreshToken) {
                await db.delete(schema.refreshTokens).where(eq(schema.refreshTokens.token, refreshToken));
            }

            reply.clearCookie('refreshToken', { path: '/users/refresh' });
            reply.status(200).send({ message: 'Logged out' });
        })
}