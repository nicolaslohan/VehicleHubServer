import z from "zod";

export const costCenterResponse = z.object({
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

export const createCostCenterParams = z.object({
    name: z.string(),
    description: z.string().optional(),
    department_id: z.number(),
    created_by: z.number(),
})

export const costCentersListResponse = z.array(costCenterResponse)
export type costCenterResponse = z.infer<typeof costCentersListResponse>
