import { eq, sql } from "drizzle-orm";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod/v4";
import { db } from "@/db/connection.ts";
import { schema } from "@/db/schema/index.ts";
import { createControllerParams } from "@/types/controllers-types.ts";

export const createControllerRoute: FastifyPluginCallbackZod = (app) => {
	app.post(
		"/controllers",
		{
			schema: {
				summary: "Criar um novo controller",
				tags: ["Controllers"],
				body: createControllerParams,
				response: {
					201: z.object({
						controllerId: z.number(),
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
			const { controller, created_by } = request.body;

			const checkControllerExists = await db
				.select({
					id: schema.controllers.controller,
				})
				.from(schema.controllers)
				.where(eq(schema.controllers.controller, controller));

			if (checkControllerExists.length > 0) {
				return reply.status(409).send({
					message: "Já existe um controller cadastrado com essa nomenclatura.",
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

			createData.controller = controller;
			createData.created_by = created_by;

			const result = await db
				.insert(schema.controllers)
				.values(createData)
				.returning();

			const insertedController = result[0];

			if (!insertedController) {
				return reply.status(500).send({
					message: "Erro ao criar novo controller.",
				});
			}

			return reply.status(201).send({
				controllerId: insertedController.id,
			});
		},
	);
};
