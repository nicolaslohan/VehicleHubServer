import { z } from 'zod'

export const departmentResponse = z.object({
    id: z.number(),
    name: z.string(),
    created_at: z.date(),
    modified_at: z.date(),
    created_by: z.object({
        id: z.number(),
        name: z.string(),
    }),
    modified_by: z.object({
        id: z.number(),
        name: z.string(),
    }),
    deleted: z.boolean(),
})

export const departmentsListResponse = z.array(departmentResponse)
export type departmentsListResponseType = z.infer<typeof departmentsListResponse>

export const createDepartmentParams = z.object({
    name: z.string(),
    description: z.string().optional(),
    created_by: z.number(),
})

export const createDepartmentParamsList = z.array(createDepartmentParams)
export type createDepartmentParamsType = z.infer<typeof createDepartmentParams>
