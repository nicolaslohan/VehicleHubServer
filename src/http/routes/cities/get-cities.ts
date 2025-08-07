import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { ZodError, z } from "zod";
import { db } from "@/db/connection.ts";
import { schema } from "@/db/schema/index.ts";
import { citiesListResponse } from "@/types/citites-types.ts";

export const getCitiesRoute: FastifyPluginCallbackZod = (app) => {
	app.get(
		"/cities",
		{
			schema: {
				summary: "Listagem de todas as cidades",
				tags: ["Cities"],
				response: {
					200: citiesListResponse,
					400: z.object({ error: z.string() }),
					500: z.object({ error: z.string() }),
				},
			},
		},
		async (request, reply) => {
			try {
				const results = await db
					.select({
						id: schema.cities.id,
						city_name: schema.cities.city_name,
						state: schema.cities.state,
						state_acronym: schema.cities.state_acronym,
						region: schema.cities.region,
						created_at: schema.cities.created_at,
						modified_at: schema.cities.modified_at,
					})
					.from(schema.cities)
					.orderBy(schema.cities.created_at);

				return reply.status(200).send(citiesListResponse.parse(results));
			} catch (err) {
				if (err instanceof ZodError) {
					return reply.status(400).send({ error: err.message });
				}
				return reply.status(500).send({ error: "Internal server error" });
			}
		},
	);
};
