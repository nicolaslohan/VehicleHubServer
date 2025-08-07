import type { fastify } from "fastify";
import supertest from "supertest";
import { db } from "@/db/connection";
import { generateTokens } from "@/services/handle-tokens";
import { verifyPassword } from "@/services/hash";
import { createTestServer } from "./server";

jest.mock("../env.ts", () => ({
	env: {
		JWT_SECRET: "secret",
	},
}));

jest.mock("@/db/connection", () => ({
	db: {
		query: {
			users: {
				findFirst: jest.fn(),
			},
		},
		select: jest.fn(),
	},
}));

jest.mock("@/services/hash", () => ({
	verifyPassword: jest.fn(),
}));

jest.mock("@/services/handle-tokens", () => ({
	generateTokens: jest.fn(),
	revokeOldTokens: jest.fn(),
}));

describe("POST /users/register - Success", () => {
	let app: ReturnType<typeof fastify>;

	beforeAll(async () => {
		app = createTestServer();
		await app.ready();

		// criar usuário de teste
		await supertest(app.server).post("/users/register").send({
			name: "John Doe",
			email: "john@example.com",
			password: "password123",
		});
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	const user = {
		id: 1,
		name: "John Doe",
		email: "john@example.com",
		password: "hashed-password",
	};

	it("should login successfully", async () => {
		(db.query.users.findFirst as jest.Mock).mockResolvedValue(user);
		(verifyPassword as jest.Mock).mockResolvedValue(true);
		(generateTokens as jest.Mock).mockResolvedValue({
			accessToken: "token",
			refreshToken: "token",
		});

		const res = await supertest(app.server).post("/users/login").send({
			email: user.email,
			password: "password123",
		});

		const cookie = res.headers["set-cookie"][0];

		expect(res.status).toBe(200);
		expect(res.body).toEqual({ accessToken: "token" });
		expect(cookie).toMatch(/^refreshToken=token/);
		expect(cookie).toContain("HttpOnly");
		expect(cookie).toContain("Max-Age=604800");
		expect(cookie).toContain("Path=/users/refresh");
	});

	it("should be unexistent email", async () => {
		(db.query.users.findFirst as jest.Mock).mockResolvedValue(null);
		(verifyPassword as jest.Mock).mockResolvedValue(true);

		const res = await supertest(app.server).post("/users/login").send({
			email: "john@example.com",
			password: "password123",
		});

		expect(res.status).toBe(401);
		expect(res.body).toEqual({
			error: "Não existe um usuário com este e-mail.",
		});
	});

	it("should be wrong password", async () => {
		(db.query.users.findFirst as jest.Mock).mockResolvedValue(user);
		(verifyPassword as jest.Mock).mockResolvedValue(false);

		const res = await supertest(app.server).post("/users/login").send({
			email: user.email,
			password: "wrong-password",
		});

		expect(res.status).toBe(401);
		expect(res.body).toEqual({ error: "Credenciais incorretas." });
	});

	it("should return 500 on unexpected error", async () => {
		// Suprime o erro no console
		const consoleSpy = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});

		(db.query.users.findFirst as jest.Mock).mockResolvedValue(user);

		// Simula erro ao tentar buscar o usuário no DB
		(db.query.users.findFirst as jest.Mock).mockImplementation(() => {
			throw new Error("DB down");
		});

		(verifyPassword as jest.Mock).mockResolvedValue(true);

		const res = await supertest(app.server).post("/users/login").send({
			email: user.email,
			password: "password123",
		});

		expect(res.status).toBe(500);
		expect(res.body).toHaveProperty("error");
		expect(res.body.error).toContain("Erro interno do servidor");

		// Restaura console.error
		consoleSpy.mockRestore();
	});
});
