import { db } from "@/db/connection";
import { schema } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod";

export const refreshRoute: FastifyPluginCallbackZod = (app) => {
    app.post('/users/refresh',
        {
            schema: {
                summary: 'Gera um novo token e revoca o antigo.',
                tags: ['Auth'],
                response: {
                    200: z.object({ accessToken: z.string() }),
                    401: z.object({ error: z.string() }),
                    403: z.object({ error: z.string() }),
                }
            }
        },
        async (request, reply) => {
            const refreshToken = request.cookies.refreshToken;
            if (!refreshToken) return reply.code(401).send({ error: 'No refresh token' });

            const tokenRow = await db.query.refreshTokens.findFirst({
                where: (t, { eq, and }) => and(
                    eq(t.token, refreshToken),
                    eq(t.revoked, false)
                ),
            });

            if (!tokenRow || tokenRow.expires_at < new Date()) {
                return reply.code(403).send({ error: 'Refresh token expiradoou inválido' });
            }

            // Rotacionar tokens
            await db
                .update(schema.refreshTokens)
                .set({ revoked: true })
                .where(eq(schema.refreshTokens.token, refreshToken));

            const user = await db.query.users.findFirst({
                where: (t, { eq }) => eq(t.id, tokenRow.user_id),
            });

            if (!user) {
                return reply.code(403).send({ error: 'Usuário não encontrado' });
            }

            // @ts-expect-error: 'jwt' is added by fastify-jwt plugin at runtime
            const tokens = await generateTokens(app, { id: user.id, email: user.email, name: user.name });

            reply.setCookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                path: '/users/refresh',
                secure: process.env.NODE_ENV === 'production' ? true : false,
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                maxAge: 60 * 60 * 24 * 7,
            });

            return { accessToken: tokens.accessToken };
        })
}