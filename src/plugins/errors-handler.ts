// src/plugins/error-handler.ts

import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

export function errorHandler(
	error: FastifyError,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	// Erros de validação JSON Schema do Fastify (ajustes de paths)
	if (error.validation) {
		const details = error.validation.map((issue: any) => ({
			field: issue.instancePath.replace(/^\//, "") || issue.dataPath || "",
			message: issue.message,
		}));

		return reply.status(400).send({
			error: "Erro de validação",
			details,
		});
	}

	// Erros de validação do Zod (tipos, refinamentos etc)
	if (error instanceof ZodError) {
		const details = error.issues.map((e) => ({
			field: e.path.join("."),
			message: e.message,
		}));

		return reply.status(400).send({
			error: "Erro de validação",
			details,
		});
	}

	request.log.error(error); // loga o erro real no backend

	return reply.status(500).send({
		error: "Erro interno do servidor",
	});
}
