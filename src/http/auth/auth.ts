import '@fastify/cookie';
import { hashPassword, verifyPassword } from '../../services/hash';
import { db } from "@/db/connection";
import { schema } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { generateTokens, revokeOldTokens } from "@/services/handle-tokens";
import { loginListSchema, loginType, registerSchema, registerType } from '@/types/user-types';
import { z } from 'zod';
import { FastifyRequest } from 'fastify';

export const registerUserRoute: FastifyPluginCallbackZod = (app) => {
    app.post('/users/register',
        {
            schema: {
                summary: 'Registrar um novo usuário.',
                tags: ['Auth'],
                body: registerSchema,
                response: {
                    201: registerSchema.pick({ name: true, email: true }).extend({ message: z.string() }),
                    400: z.object({ error: z.string(), details: z.array(z.object({ field: z.string(), message: z.string() })).optional() }),
                    401: z.object({ error: z.string() }),
                },
            },
        },
        async (request, reply) => {
            const { name, email, password, confirmPassword } = request.body;

            // Hash da senha
            const hashedPassword = await hashPassword(password);

            try {
                // Verificar se o usuario já existe
                const existingUser = await db
                    .select()
                    .from(schema.users)
                    .where(eq(schema.users.email, email))

                if ((existingUser.length > 0)) return reply.code(400).send({ error: "Já existe um usuário cadastrado com este e-mail." })

                await db.insert(schema.users).values({ name, email, password: hashedPassword });
                return reply.code(201).send({ message: "Usuário registrado com sucesso!", name, email });
            } catch (e: any) {
                // Erro inesperado
                return reply.code(500).send({ error: "Erro interno do servidor: " + e.message });
            }
        }
    );
}

export const loginUserRoute: FastifyPluginCallbackZod = (app) => {
    app.post('/users/login',
        {
            schema: {
                summary: 'Login user',
                tags: ['Auth'],
                body: loginListSchema,
                response: {
                    200: z.object({ accessToken: z.string() }),
                    401: z.object({ error: z.string() }),
                },
            },
        },
        async (request: FastifyRequest<{ Body: loginType }>, reply) => {
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

            return { accessToken: tokens.accessToken };

        }
    )
}

export const meRoute: FastifyPluginCallbackZod = (app) => {
    app.get('/users/me',

        {
            schema: {
                summary: 'Retorna dados do usuário logado.',
                tags: ['Auth'],
                response: {
                    200: z.object({ user: z.any() }),
                },
            },
            preHandler: [app.authenticate]
        },

        async (request: any, reply) => {
            reply.send({ user: request.user });
        });
}

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