import z from "zod";

export const actionResponse = z.object({
	id: z.number(),
	action: z.string(),
	created_at: z.date(),
	modified_at: z.date().nullable(),
	created_by: z.object({
		id: z.number(),
		name: z.string(),
	}),
	modified_by: z
		.object({
			id: z.number(),
			name: z.string(),
		})
		.nullable(),
	deleted: z.boolean(),
});

export const actionsListResponse = z.array(actionResponse);
export type actionsListResponseType = z.infer<typeof actionsListResponse>;

export const createActionParams = z.object({
	action: z.string().min(1, "Ação é obrigatória"),
	created_by: z.number("O ID do usuário é obrigatório"),
});

export const createActionListParams = z.array(createActionParams);
export type createActionListParamsType = z.infer<typeof createActionListParams>;

export const updateActionParams = z.object({
	action: z.string().min(1, "Ação é obrigatória"),
	modified_by: z.number("O ID do usuário é obrigatório"),
});

export const updateActionListParams = z.array(updateActionParams);
export type updateActionListParamsType = z.infer<typeof updateActionListParams>;
