import z from 'zod'

export const controllerResponse = z.object({
    id: z.bigint(),
    controller: z.string(),
    created_at: z.date(),
    modified_at: z.date(),
    created_by:
        z.object({
            id: z.number(),
            name: z.string(),
        }),
    modified_by:
        z.object({
            id: z.number(),
            name: z.string(),
        }),
    deleted: z.boolean()
})

export const controllerListResponse = z.array(controllerResponse)
export type controllerListResponseType = z.infer<typeof controllerListResponse>

export const createControllerParams = z.object({
    controller: z.string(),
    created_by: z.number(),
})

export const createControlleListParams = z.array(createControllerParams)
export type createControllerListType = z.infer<typeof createControlleListParams>


export const updateControllerParams = z.object({
    controller: z.string(),
    modified_by: z.number()
})

export const updateControlleListParams = z.array(updateControllerParams)
export type updateControllerListType = z.infer<typeof updateControlleListParams>