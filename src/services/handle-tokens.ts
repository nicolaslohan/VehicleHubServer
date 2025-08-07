import { randomUUID } from "crypto";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { db } from "@/db/connection";
import { refreshTokens } from "@/db/schema/refresh_tokens";

export async function generateTokens(
	fastify: FastifyPluginCallbackZod,
	user: { id: number; email: string; name: string },
) {
	// @ts-expect-error: 'jwt' is added by fastify-jwt plugin at runtime
	const accessToken = fastify.jwt.sign(user, { expiresIn: "15m" });

	const refreshToken = randomUUID(); // can be a JWT or opaque token
	const expiresAt = dayjs().add(7, "days").toDate();

	await db.insert(refreshTokens).values({
		user_id: user.id,
		token: refreshToken,
		expires_at: expiresAt,
	});

	return { accessToken, refreshToken };
}

export async function revokeOldTokens(
	fastify: FastifyPluginCallbackZod,
	userId: number,
) {
	await db
		.update(refreshTokens)
		.set({ revoked: true })
		.where(eq(refreshTokens.user_id, userId));
}
