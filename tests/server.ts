// tests/server.ts

import fastifyMultipart from "@fastify/multipart";
import { fastify } from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { createActionRoute } from "@/http/routes/actions/create-action.ts";
import { deleteActionRoute } from "@/http/routes/actions/delete-action.ts";
import { getActionsRoute } from "@/http/routes/actions/get-actions.ts";
import { updateActionRoute } from "@/http/routes/actions/update-action.ts";
import { loginUserRoute } from "@/http/routes/auth/login-user.ts";
// Rotas básicas
import { meRoute } from "@/http/routes/auth/me.ts";
import { registerUserRoute } from "@/http/routes/auth/register-user.ts";
import { authPlugin } from "@/plugins/auth.ts";
import { errorHandler } from "@/plugins/errors-handler.ts";
import jwtPlugin from "@/plugins/jwt.ts";
import { env } from "../env.ts";

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
	app.register(deleteActionRoute);
	app.register(updateActionRoute);
	app.register(getActionsRoute);

	return app;
}
