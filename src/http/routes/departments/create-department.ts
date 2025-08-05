import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { schema } from '@/db/schema/index.ts'
import { db } from '@/db/connection.ts'
import { eq, sql } from 'drizzle-orm'
import { createDepartmentParams, createDepartmentParamsList } from '@/types/department-types.ts'

export const createDepartmentRoute: FastifyPluginCallbackZod = (app) => {
    app.post(
        '/departments',
        {
            schema: {
                summary: 'Criar um novo departamento',
                tags: ['Departments'],
                body: createDepartmentParams,
                response: {
                    200: z.object({
                        departmentId: z.number()
                    }),
                    400: z.object({
                        message: z.string()
                    }),
                    404: z.object({
                        message: z.string()
                    }),
                    409: z.object({
                        message: z.string()
                    }),
                    500: z.object({
                        message: z.string()
                    })
                }
            },
        },
        async (request, reply) => {
            const { name, description, created_by } = request.body

            const checkDepartmentExists = await db
                .select({
                    id: schema.departments.name
                })
                .from(schema.departments)
                .where(
                    eq(schema.departments.name, name)
                )

            if (checkDepartmentExists.length > 0) {
                return reply.status(409).send({
                    message: 'Já existe um departamento cadastrado com essa nomenclatura.'
                })
            }

            if (!created_by) {
                return reply.status(400).send({
                    message: 'Usuário não informado.'
                })
            }

            const checkUserExists = await db
                .select({
                    id: schema.users.id
                })
                .from(schema.users)
                .where(
                    sql`${schema.users.id} = ${created_by}`
                )

            if (!(checkUserExists.length > 0)) {
                return reply.status(404).send({
                    message: 'Usuário não encontrado.'
                })
            }

            const createData: any = {}

            createData.name = name
            createData.created_by = created_by

            if (description) createData.description = description


            const result = await db
                .insert(schema.departments)
                .values(createData)
                .returning()

            const insertedDepartments = result[0]

            if (!insertedDepartments) {
                return reply.status(500).send({
                    message: 'Erro ao criar novo departamento.'
                })
            }

            return reply.status(201).send({
                departmentId: insertedDepartments.id
            })
        }
    )
}