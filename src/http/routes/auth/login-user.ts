import '@fastify/cookie';
import { generateTokens, revokeOldTokens } from "@/services/handle-tokens";
import { db } from "@/db/connection";
import { verifyPassword } from "@/services/hash";
import { loginSchema } from "@/types/user-types";
import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod";


export const loginUserRoute: FastifyPluginCallbackZod = (app) => {
    app.post('/users/login',
        {
            schema: {
                summary: 'Login user',
                tags: ['Auth'],
                body: loginSchema,
                response: {
                    200: z.object({ accessToken: z.string() }),
                    401: z.object({ error: z.string() }),
                },
            },
        },
        async (request, reply) => {
            const { email, password } = request.body;

            const user = await db.query.users.findFirst({
                where: (t, { eq }) => eq(t.email, email),
            });

            if (!user) {
                return reply.code(401).send({ error: "Não existe um usuário com este e-mail." });
            }

            if (!(await verifyPassword(password, user.password))) {
                return reply.code(401).send({ error: "Credenciais incorretas." });
            }

            try {
                // @ts-expect-error: 'jwt' is added by fastify-jwt plugin at runtime
                revokeOldTokens(app, user.id)

                // @ts-expect-error: 'jwt' is added by fastify-jwt plugin at runtime
                const tokens = await generateTokens(app, { id: user.id, email: user.email, name: user.name });

                reply.setCookie('refreshToken', tokens.refreshToken, {
                    httpOnly: true,
                    path: '/users/refresh',
                    secure: process.env.NODE_ENV === 'production' ? true : false,
                    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                    maxAge: 60 * 60 * 24 * 7, // 7 days
                });

                return reply.status(200).send({ accessToken: tokens.accessToken });
            } catch (err) {
                if (err instanceof Error) {
                    return reply.code(500).send({ error: err.message });
                }
                return reply.code(500).send({ error: "Erro interno do servidor" });
            }
        }
    )
}