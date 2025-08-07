import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core/alias";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z, { ZodError } from "zod";
import { actionsListResponse } from "@/types/action-types.ts";
import { db } from "../../../db/connection.ts";
import { schema } from "../../../db/schema/index.ts";

export const getActionsRoute: FastifyPluginCallbackZod = (app) => {
	app.get(
		"/actions",
		{
			schema: {
				summary: "Listagem de todas as ações",
				tags: ["Actions"],
				response: {
					200: actionsListResponse,
					400: z.object({ error: z.string() }),
					500: z.object({ error: z.string() }),
				},
			},
		},
		async (request, reply) => {
			try {
				const modified_by_user = alias(schema.users, "modified_by_user");
				const created_by_user = alias(schema.users, "created_by_user");

				const results = await db
					.select({
						id: schema.actions.id,
						action: schema.actions.action,
						created_at: schema.actions.created_at,
						modified_at: schema.actions.modified_at,
						created_by: {
							id: created_by_user.id,
							name: created_by_user.name,
						},
						modified_by: {
							id: modified_by_user.id,
							name: modified_by_user.name,
						},
						deleted: schema.actions.deleted,
					})
					.from(schema.actions)
					.leftJoin(
						created_by_user,
						eq(created_by_user.id, schema.actions.created_by),
					)
					.leftJoin(
						modified_by_user,
						eq(modified_by_user.id, schema.actions.modified_by),
					)
					.orderBy(schema.actions.created_at);

				return reply.status(200).send(actionsListResponse.parse(results));
			} catch (err) {
				if (err instanceof ZodError) {
					return reply.status(400).send({ error: err.message });
				}
				return reply.status(500).send({ error: "Internal server error" });
			}
		},
	);
};
