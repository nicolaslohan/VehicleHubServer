import z from 'zod'

export const actionResponse = z.object({
    id: z.bigint(),
    action: z.string(),
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

export const actionsListResponse = z.array(actionResponse)
export type actionsListResponseType = z.infer<typeof actionsListResponse>

export const createActionParams = z.object({
    action: z.string(),
    created_by: z.number(),
})

export const createActionListParams = z.array(createActionParams)
export type createActionListParamsType = z.infer<typeof createActionListParams>

export const updateActionParams = z.object({
    action: z.string(),
    modified_by: z.number(),
})

export const updateActionListParams = z.array(updateActionParams)
export type updateActionListParamsType = z.infer<typeof updateActionListParams>