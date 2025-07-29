import { fastify } from 'fastify'
import { sql } from './db/connection.ts'
import {
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider
} from 'fastify-type-provider-zod'
import { fastifyCors } from '@fastify/cors'
import { env } from '../env.ts'
import fastifyMultipart from '@fastify/multipart'
import { createUserRoute } from './http/routes/create-user.ts'
import { getUserRoute } from './http/routes/get-users.ts'

if (!process.env.PORT) {

    process.exit(1)

}

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
    origin: 'http://localhost:5173'
})

app.register(fastifyMultipart)

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)


app.get('/health', () => {
    return { status: 'OK' }
})

app.register(getUserRoute)
app.register(createUserRoute)

app.listen({ port: env.PORT }).then(() => {
    console.log(`HTTP server running on port ${env.PORT}`)
})

