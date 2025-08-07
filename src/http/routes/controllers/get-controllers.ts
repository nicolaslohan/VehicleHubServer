import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core/alias";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z, { ZodError } from "zod";
import { db } from "@/db/connection.ts";
import { schema } from "@/db/schema/index.ts";
import { controllerListResponse } from "@/types/controllers-types.ts";

export const getControllersRoute: FastifyPluginCallbackZod = (app) => {
	app.get(
		"/controllers",
		{
			schema: {
				summary: "Listagem de todos os controllers",
				tags: ["Controllers"],
				response: {
					200: controllerListResponse,
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
						id: schema.controllers.id,
						controller: schema.controllers.controller,
						created_at: schema.controllers.created_at,
						modified_at: schema.controllers.modified_at,
						created_by: {
							id: created_by_user.id,
							name: created_by_user.name,
						},
						modified_by: {
							id: modified_by_user.id,
							name: modified_by_user.name,
						},
						deleted: schema.controllers.deleted,
					})
					.from(schema.controllers)
					.leftJoin(
						created_by_user,
						eq(created_by_user.id, schema.controllers.created_by),
					)
					.leftJoin(
						modified_by_user,
						eq(modified_by_user.id, schema.controllers.modified_by),
					)
					.orderBy(schema.controllers.created_at);

				return reply.status(200).send(controllerListResponse.parse(results));
			} catch (err) {
				if (err instanceof ZodError) {
					return reply.status(400).send({ error: err.message });
				}
				return reply.status(500).send({ error: "Internal server error" });
			}
		},
	);
};
