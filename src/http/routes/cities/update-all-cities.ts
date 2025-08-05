import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import axios from 'axios';
import { db } from '@/db/connection.ts';
import { schema } from '@/db/schema/index.ts';
import { sql } from 'drizzle-orm';
import z from 'zod';

export const updateAllCitiesRoute: FastifyPluginCallbackZod = (app) => {
    app.post('/cities/update-all',
        {
            schema: {
                summary: 'Atualiza todas as cidades',
                tags: ['Cities'],
                response: {
                    200: z.object({ message: z.string(), count: z.number() }),
                    500: z.object({ message: z.string(), error: z.string() }),
                }
            }
        },
        async (request, reply) => {
            try {
                // Fetch all cities from IBGE API
                const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/municipios');
                const cities = response.data;


                const cityData = cities.map((city: any) => {
                    const microrregiao = city.microrregiao;
                    const mesorregiao = microrregiao && microrregiao.mesorregiao;
                    const uf = mesorregiao && mesorregiao.UF;
                    const regiao = uf && uf.regiao;
                    return {
                        id: BigInt(city.id),
                        city_name: city.nome ?? 'SEM INFORMAÇÃO',
                        state: uf && uf.nome ? uf.nome : 'SEM INFORMAÇÃO',
                        state_acronym: uf && uf.sigla ? uf.sigla : 'SEM INFORMAÇÃO',
                        region: regiao && regiao.nome ? regiao.nome : 'SEM INFORMAÇÃO'
                    };
                });

                // Upsert each city (replace with bulk upsert if supported)
                for (const city of cityData) {
                    await db.insert(schema.cities)
                        .values(city)
                        .onConflictDoUpdate({
                            target: schema.cities.id,
                            set: {
                                city_name: city.city_name,
                                state: city.state,
                                state_acronym: city.state_acronym,
                                region: city.region,
                                modified_at: sql`CASE WHEN 
                                EXCLUDED.city_name <> cities.city_name OR 
                                EXCLUDED.state <> cities.state OR 
                                EXCLUDED.state_acronym <> cities.state_acronym OR 
                                EXCLUDED.region <> cities.region 
                                THEN CURRENT_TIMESTAMP ELSE cities.modified_at END`
                            }
                        });
                }

                return reply.status(200).send({ message: 'Cities updated successfully', count: cityData.length });
            } catch (error) {
                console.error(error);
                const errMsg = error instanceof Error ? error.message : String(error);
                return reply.status(500).send({ message: 'Failed to update cities', error: errMsg });
            }
        });
};
