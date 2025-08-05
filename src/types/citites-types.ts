import { z } from "zod";

export const citiesResponseSchema = z.object({
    id: z.number(),
    city_name: z.string(),
    state: z.string(),
    state_acronym: z.string(),
    region: z.string(),
    created_at: z.date(),
    modified_at: z.date()
})


export type citiesResponse = z.infer<typeof citiesResponseSchema>
export const citiesListResponse = z.array(citiesResponseSchema)
export type citiesListResponseType = z.infer<typeof citiesListResponse>;