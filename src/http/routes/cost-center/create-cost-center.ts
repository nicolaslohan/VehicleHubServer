import { eq, sql } from "drizzle-orm";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod/v4";
import { db } from "@/db/connection.ts";
import { schema } from "@/db/schema/index.ts";
import { createCostCenterParams } from "@/types/cost-center-types.ts";

export const createCostCenterRoute: FastifyPluginCallbackZod = (app) => {
	app.post(
		"/cost_centers",
		{
			schema: {
				summary: "Criar um novo centro de custo",
				tags: ["Cost Centers"],
				body: createCostCenterParams,
				response: {
					201: z.object({
						costCenterId: z.number(),
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
			const { name, description, department_id, created_by } = request.body;

			const checkCostCenterExists = await db
				.select({
					id: schema.cost_centers.name,
				})
				.from(schema.cost_centers)
				.where(eq(schema.cost_centers.name, name));

			if (checkCostCenterExists.length > 0) {
				return reply.status(409).send({
					message:
						"Já existe um centro de custo cadastrado com essa nomenclatura.",
				});
			}

			if (!department_id) {
				return reply.status(400).send({
					message: "Departamento não informado.",
				});
			}

			const checkDepartmentExists = await db
				.select({
					id: schema.departments.id,
				})
				.from(schema.departments)
				.where(sql`${schema.departments.id} = ${department_id}`);

			if (!(checkDepartmentExists.length > 0)) {
				return reply.status(404).send({
					message: "Departamento não encontrado.",
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

			createData.name = name;
			createData.department_id = department_id;
			createData.created_by = created_by;

			if (description) createData.description = description;

			const result = await db
				.insert(schema.cost_centers)
				.values(createData)
				.returning();

			const insertedCostCenter = result[0];

			if (!insertedCostCenter) {
				return reply.status(500).send({
					message: "Erro ao criar novo centro de custo.",
				});
			}

			return reply.status(201).send({
				costCenterId: insertedCostCenter.id,
			});
		},
	);
};
