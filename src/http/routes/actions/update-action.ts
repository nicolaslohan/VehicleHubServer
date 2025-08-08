import { eq, sql } from "drizzle-orm";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { ZodError } from "zod";
import { z } from "zod/v4";
import { db } from "@/db/connection.ts";
import { schema } from "@/db/schema/index.ts";
import { updateActionParams } from "@/types/action-types.ts";

export const updateActionRoute: FastifyPluginCallbackZod = (app) => {
	app.put(
		"/actions/:id",
		{
			schema: {
				params: z.object({
					id: z.string(),
				}),
				summary: "Altera uma ação",
				tags: ["Actions"],
				body: updateActionParams,
				response: {
					200: z.object({
						message: z.string(),
					}),
					404: z.object({
						message: z.string(),
					}),
					500: z.object({
						error: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			try {
				const { id } = request.params;
				const { action, modified_by } = request.body;

				const checkActionsExists = await db
					.select({
						id: schema.actions.id,
					})
					.from(schema.actions)
					.where(sql`${schema.actions.id} = ${id}`);

				if (!(checkActionsExists.length > 0)) {
					return reply.status(404).send({
						message: "Ação não encontrada.",
					});
				}

				const checkUserExists = await db
					.select({
						id: schema.users.id,
					})
					.from(schema.users)
					.where(sql`${schema.users.id} = ${modified_by}`);

				if (!(checkUserExists.length > 0)) {
					return reply.status(404).send({
						message: "Usuário não encontrado.",
					});
				}

				const updateData: any = {};

				updateData.action = action;
				updateData.modified_by = modified_by;
				updateData.modified_at = new Date();

				const updateAction = await db
					.update(schema.actions)
					.set({
						action: updateData.action,
						modified_by: updateData.modified_by,
						modified_at: updateData.modified_at,
					})
					.where(sql`${schema.actions.id} = ${id}`)
					.returning();

				const updatedAction = updateAction[0];

				if (!updatedAction) {
					return reply.status(500).send({
						error: "Erro ao alterar ação.",
					});
				}

				return reply.status(200).send({
					message: "Ação alterada com sucesso.",
				});
			} catch (err) {
				if (err instanceof ZodError) {
					return reply.status(500).send({
						error: err.message,
					});
				}

				return reply.status(500).send({
					error: "Erro interno do servidor.",
				});
			}
		},
	);
};
