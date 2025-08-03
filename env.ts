// src/env.ts
import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
    NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
    DATABASE_URL: z.string().url().startsWith('postgresql://'), // Garante que é uma string no formato de URL
    PORT: z.coerce.number().default(3333),
    JWT_SECRET: z.string().min(1),
})

export const env = envSchema.parse(process.env)