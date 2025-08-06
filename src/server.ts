import { fastify } from 'fastify'
import jwtPlugin from './plugins/jwt.ts'
import {
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,
    jsonSchemaTransform
} from 'fastify-type-provider-zod'
import { fastifyCors } from '@fastify/cors'
import { env } from '../env.ts'
import fastifyMultipart from '@fastify/multipart'
import { getUserRoute } from './http/routes/users/get-users.ts'
import { updateUserRoute } from './http/routes/users/update-user.ts'
import { deleteUserRoute } from './http/routes/users/delete-user.ts'
import { getCitiesRoute } from './http/routes/cities/get-cities.ts'
import { updateAllCitiesRoute } from './http/routes/cities/update-all-cities.ts'
import { createDepartmentRoute } from './http/routes/departments/create-department.ts'
import { createCostCenterRoute } from './http/routes/cost-center/create-cost-center.ts'
import { deleteCostCenterRoute } from './http/routes/cost-center/delete-cost-center.ts'
import { getCostCenterRoute } from './http/routes/cost-center/get-cost-center.ts'
import { getDepartmentsRoute } from './http/routes/departments/get-departments.ts'
import { deleteDepartmentRoute } from './http/routes/departments/delete-department.ts'
import { getActionsRoute } from './http/routes/actions/get-actions.ts'
import { createActionRoute } from './http/routes/actions/create-action.ts'
import { deleteActionRoute } from './http/routes/actions/delete-action.ts'
import { updateActionRoute } from './http/routes/actions/update-action.ts'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { getControllersRoute } from './http/routes/controllers/get-controllers.ts'
import { deleteControllerRoute } from './http/routes/controllers/delete-controller.ts'
import { createControllerRoute } from './http/routes/controllers/create-controller.ts'
import { updateControllerRoute } from './http/routes/controllers/update-controller.ts'
import { updateCostCenterRoute } from './http/routes/cost-center/update-cost-center.ts'
import { errorHandler } from './plugins/errors-handler.ts'
import { loginUserRoute } from './http/routes/auth/login-user.ts'
import { registerUserRoute } from './http/routes/auth/register-user.ts'
import { meRoute } from './http/routes/auth/me.ts'
import { refreshRoute } from './http/routes/auth/refresh-user.ts'
import { logoutRoute } from './http/routes/auth/logout-user.ts'

if (!process.env.PORT) {

    process.exit(1)

}

async function startServer() {
    const app = fastify().withTypeProvider<ZodTypeProvider>()

    await app.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'VehicleHub API',
                description: 'API with TypeScript + Fastify + Zod + Drizzle ORM + Postgres',
                version: '1.0.0',
            },
            tags: [],
        },
        transform: jsonSchemaTransform,
    });

    await app.register(fastifySwaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false,
        },
    });

    app.register(fastifyCors, {
        origin: 'http://localhost:5173'
    })

    app.register(fastifyMultipart)

    app.setSerializerCompiler(serializerCompiler)
    app.setValidatorCompiler(validatorCompiler)

    app.setErrorHandler(errorHandler)

    app.register(jwtPlugin, { secret: env.JWT_SECRET })
    app.register(require('@fastify/cookie'));

    // Auth Routes
    app.register(loginUserRoute)
    app.register(registerUserRoute)
    app.register(meRoute)
    app.register(refreshRoute)
    app.register(logoutRoute)

    // // Users Routes
    app.register(getUserRoute)
    app.register(updateUserRoute)
    app.register(deleteUserRoute)

    // Cities Routes
    app.register(getCitiesRoute)
    app.register(updateAllCitiesRoute)

    // // Department Routes
    app.register(getDepartmentsRoute)
    app.register(createDepartmentRoute)
    app.register(deleteDepartmentRoute)

    // Cost Centers Routes
    app.register(getCostCenterRoute)
    app.register(createCostCenterRoute)
    app.register(updateCostCenterRoute)
    app.register(deleteCostCenterRoute)

    // Actions Routes
    app.register(getActionsRoute)
    app.register(createActionRoute)
    app.register(updateActionRoute)
    app.register(deleteActionRoute)

    // Controllers Routes
    app.register(getControllersRoute)
    app.register(createControllerRoute)
    app.register(updateControllerRoute)
    app.register(deleteControllerRoute)



    app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
        console.log(`HTTP server running on port ${env.PORT}`)
    })
}

startServer()