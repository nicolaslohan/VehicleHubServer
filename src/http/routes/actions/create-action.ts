import { eq, sql } from "drizzle-orm";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
	createActionParams,
} from "@/types/action-types.ts";
import { db } from "@/db/connection.ts";
import { schema } from "@/db/schema/index.ts";
import { ZodError } from "zod";

export const createActionRoute: FastifyPluginCallbackZod = (app) => {
	app.post(
		"/actions",
		{
			schema: {
				summary: "Cria uma nova ação",
				tags: ["Actions"],
				body: createActionParams,
				response: {
					200: z.object({
						actionId: z.number(),
					}),
					400: z.object({
						message: z.string(),
					}),
					404: z.object({
						message: z.string(),
					}),
					409: z.object({
						message: z.string(),
					}),
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {

			try {
				const { action, created_by } = request.body;

				const checkActionExists = await db
					.select({
						id: schema.actions.action,
					})
					.from(schema.actions)
					.where(eq(schema.actions.action, action));

				if (checkActionExists.length > 0) {
					return reply.status(409).send({
						message: "Já existe uma ação cadastrada com essa nomenclatura.",
					});
				}

				if (!created_by) {
					return reply.status(400).send({
						message: "Usuário não informado.",
					});
				}

				const checkUserExists = await db
					.select({
						id: schema.users.id,
					})
					.from(schema.users)
					.where(sql`${schema.users.id} = ${created_by}`);

				if (!(checkUserExists.length > 0)) {
					return reply.status(404).send({
						message: "Usuário não encontrado.",
					});
				}

				const createData: any = {};

				createData.action = action;
				createData.created_by = created_by;

				const result = await db
					.insert(schema.actions)
					.values(createData)
					.returning();

				const insertedAction = result[0];

				if (!insertedAction) {
					return reply.status(500).send({
						message: "Erro ao criar ação.",
					});
				}

				return reply.status(201).send({
					actionId: insertedAction.id,
				});
			} catch(err) {
				if (err instanceof ZodError) {
					return reply.status(400).send({
						message: err.message,
					});
				}

				return reply.status(500).send({
					message: "Erro interno do servidor.",
				});
			}
			
		},
	);
};
