import type { fastify } from "fastify";
import supertest from "supertest";
import { db } from "@/db/connection";
import { createTestServer } from "./server";

jest.mock("../env.ts", () => ({
	env: {
		JWT_SECRET: "secret",
	},
}));

jest.mock("@/db/connection", () => ({
	db: {
		select: jest.fn(),
		insert: jest.fn(),
	},
}));

describe("POST /actions - Success", () => {
	let app: ReturnType<typeof fastify>;

	beforeAll(async () => {
		app = createTestServer();
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	const actionPayload = {
		action: "test_action",
		created_by: 1,
	};

	it("should create a new action with success", async () => {
		// Mock da cadeia select().from().where() para verificar se a ação existe
		const whereMock1 = jest.fn().mockResolvedValueOnce([]); // ação não existe
		const fromMock1 = jest.fn(() => ({ where: whereMock1 }));
		(db.select as jest.Mock).mockImplementationOnce(() => ({
			from: fromMock1,
		}));

		// Mock da cadeia select().from().where() para verificar se o usuário existe
		const whereMock2 = jest.fn().mockResolvedValueOnce([{ id: 1 }]); // usuário existe
		const fromMock2 = jest.fn(() => ({ where: whereMock2 }));
		(db.select as jest.Mock).mockImplementationOnce(() => ({
			from: fromMock2,
		}));

		// Mock da cadeia insert().values().returning() para inserir a ação
		const returningMock = jest.fn().mockResolvedValue([{ id: 999 }]);
		const valuesMock = jest.fn(() => ({ returning: returningMock }));
		(db.insert as jest.Mock).mockReturnValue({ values: valuesMock });

		const response = await supertest(app.server).post("/actions").send({
			action: "test_action",
			created_by: 1,
		});

		expect(response.status).toBe(201);
		expect(response.body).toEqual({ actionId: 999 });
	});

	it("should return 409 if action already exists", async () => {
		// Mock: ação existe
		const whereMock = jest
			.fn()
			.mockResolvedValue({ id: 1, action: "test_action" });
		const fromMock = jest.fn(() => ({ where: whereMock }));
		(db.select as jest.Mock).mockReturnValue({ from: fromMock });

		// Mock da cadeia select().from().where() para verificar se o usuário existe
		const whereMock2 = jest.fn().mockResolvedValueOnce([{ id: 1 }]); // usuário existe
		const fromMock2 = jest.fn(() => ({ where: whereMock2 }));
		(db.select as jest.Mock).mockImplementationOnce(() => ({
			from: fromMock2,
		}));

		const response = await supertest(app.server)
			.post("/actions")
			.send(actionPayload);

		expect(response.status).toBe(409);
		expect(response.body).toEqual({
			message: "Já existe uma ação cadastrada com essa nomenclatura.",
		});
	});

	it("should return 404 if user does not exist", async () => {
		// Mock: ação não existe
		const whereMock = jest.fn().mockResolvedValue([]);
		const fromMock = jest.fn(() => ({ where: whereMock }));
		(db.select as jest.Mock) = jest.fn(() => ({ from: fromMock }));

		const res = await supertest(app.server)
			.post("/actions")
			.send(actionPayload);

		expect(res.status).toBe(404);
		expect(res.body).toEqual({
			message: "Usuário não encontrado.",
		});
	});

	it("should return 500 on unexpected error", async () => {
		// Suprime o erro no console
		const consoleSpy = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});

		// Simula erro ao tentar buscar a ação no DB
		const fromMock = jest.fn().mockImplementation(() => {
			throw new Error("DB down");
		});
		(db.select as jest.Mock).mockReturnValue({ from: fromMock });

		const res = await supertest(app.server)
			.post("/actions")
			.send(actionPayload);

		expect(res.status).toBe(500);
		expect(res.body).toHaveProperty("error");
		expect(res.body.error).toContain("Erro interno do servidor");

		// Restaura console.error
		consoleSpy.mockRestore();
	});
});
