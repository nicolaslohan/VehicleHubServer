// tests/server.ts

import { fastify } from "fastify";
import fastifyMultipart from "@fastify/multipart";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import { env } from "../env.ts";

import jwtPlugin from "@/plugins/jwt.ts";
import { authPlugin } from "@/plugins/auth.ts";
import { errorHandler } from "@/plugins/errors-handler.ts";

// Rotas básicas
import { meRoute } from "@/http/routes/auth/me.ts";
import { registerUserRoute } from "@/http/routes/auth/register-user.ts";
import { loginUserRoute } from "@/http/routes/auth/login-user.ts";
import { createActionRoute } from "@/http/routes/actions/create-action.ts";

export function createTestServer({ mockAuth = false } = {}) {
	const app = fastify().withTypeProvider<ZodTypeProvider>();

	app.register(require("@fastify/cookie"));
	app.register(fastifyMultipart);

	app.setValidatorCompiler(validatorCompiler);
	app.setSerializerCompiler(serializerCompiler);
	app.setErrorHandler(errorHandler);

	// Apenas registra o JWT plugin real se mockAuth for false
	if (!mockAuth) {
		app.register(jwtPlugin, { secret: env.JWT_SECRET });
		app.register(authPlugin);
	} else {
		// Decorador mockado para testes
		if (!app.hasDecorator("authenticate")) {
			app.decorate("authenticate", async (request, reply) => {
				request.user = { id: "user123", name: "Test User" };
			});
		}
	}

	// Rotas essenciais
	app.register(registerUserRoute);
	app.register(loginUserRoute);
	app.register(meRoute);
	app.register(createActionRoute);

	return app;
}
