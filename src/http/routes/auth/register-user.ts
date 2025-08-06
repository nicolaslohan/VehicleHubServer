import '@fastify/cookie';
import { hashPassword } from '@/services/hash';
import { db } from "@/db/connection";
import { schema } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { registerSchema } from '@/types/user-types';
import { z } from 'zod';

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
