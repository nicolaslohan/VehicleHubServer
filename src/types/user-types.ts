import { z } from 'zod'

export const registerSchema = z
    .object({
        name: z.string().min(1, 'Nome é obrigatório.'),
        email: z.string().email('Email inválido.'),
        password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
        confirmPassword: z.string().min(6, 'Confirme sua senha com pelo menos 6 caracteres.'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'As senhas não são iguais.',
        path: ['confirmPassword'],
    });


export const registerListSchema = z.array(registerSchema);
export type registerType = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const loginListSchema = z.array(loginSchema);
export type loginType = z.infer<typeof loginSchema>;

export const UserResponseSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    created_at: z.date(),
});

export const UsersListResponseSchema = z.array(UserResponseSchema);
export type UserResponse = z.infer<typeof UserResponseSchema>;