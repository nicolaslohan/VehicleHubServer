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
		update: jest.fn(),
	},
}));

describe("PUT /actions/:id - Success", () => {
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

	const idParam = {
		id: "1",
	};

	const updatePayload = {
		action: "test_action_update",
		modified_by: 1,
	};

	it("should update a action with success", async () => {
		// 1. Mock da cadeia onde a ação existe
		const whereMock = jest.fn().mockResolvedValueOnce([{ id: 1 }]);
		const fromMock = jest.fn(() => ({ where: whereMock }));

		// 2. Mock da cadeia onde o usuário existe
		const whereMock2 = jest.fn().mockResolvedValueOnce([{ id: 1 }]);
		const fromMock2 = jest.fn(() => ({ where: whereMock2 }));

		// ordem dos selects
		(db.select as jest.Mock)
			.mockImplementationOnce(() => ({ from: fromMock })) // primeiro select: ação existe
			.mockImplementationOnce(() => ({ from: fromMock2 })); // segundo select: usuário existe

		// 3. Mock do update
		const returningMock = jest.fn().mockResolvedValue([{ id: 1 }]);
		const whereMock3 = jest.fn(() => ({ returning: returningMock }));
		const setMock = jest.fn(() => ({ where: whereMock3 }));
		const updateMock = jest.fn(() => ({ set: setMock }));
		(db.update as jest.Mock).mockImplementation(updateMock);

		const response = await supertest(app.server)
			.put(`/actions/${idParam.id}`)
			.send(updatePayload);

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			message: "Ação alterada com sucesso.",
		});
	});

	it("should return 404 if action does not exist", async () => {
		// 1. Mock da cadeia onde a ação não existe
		const whereMock = jest.fn().mockResolvedValueOnce([]);
		const fromMock = jest.fn(() => ({ where: whereMock }));
		(db.select as jest.Mock).mockReturnValue({ from: fromMock });

		const response = await supertest(app.server)
			.put(`/actions/${idParam.id}`)
			.send(updatePayload);

		expect(response.status).toBe(404);
		expect(response.body).toEqual({
			message: "Ação não encontrada.",
		});
	});

	it("should return 404 if user does not exist", async () => {
		// 1. Mock da cadeia onde a ação existe
		const whereMock = jest.fn().mockResolvedValueOnce([{ id: 1 }]);
		const fromMock = jest.fn(() => ({ where: whereMock }));

		// 2. Mock da cadeia onde o usuário não existe
		const whereMock2 = jest.fn().mockResolvedValueOnce([]); // usuário não encontrado
		const fromMock2 = jest.fn(() => ({ where: whereMock2 }));

		// ordem dos selects
		(db.select as jest.Mock)
			.mockImplementationOnce(() => ({ from: fromMock })) // primeiro select: ação existe
			.mockImplementationOnce(() => ({ from: fromMock2 })); // segundo select: usuário não existe

		// Mock do update
		const returningMock = jest.fn().mockResolvedValue([{ id: 1 }]);
		const whereMock3 = jest.fn(() => ({ returning: returningMock }));
		const setMock = jest.fn(() => ({ where: whereMock3 }));
		const updateMock = jest.fn(() => ({ set: setMock }));
		(db.update as jest.Mock).mockImplementation(updateMock);

		const response = await supertest(app.server)
			.put(`/actions/${idParam.id}`)
			.send(updatePayload);

		expect(response.status).toBe(404);
		expect(response.body).toEqual({
			message: "Usuário não encontrado.",
		});
	});

	it("should return 500 on unexpected error", async () => {
		// Suprime o erro no console
		const consoleSpy = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});

		// Simula erro ao tentar buscar ação no DB
		const fromMock = jest.fn().mockImplementation(() => {
			throw new Error("DB down");
		});
		(db.select as jest.Mock).mockReturnValue({ from: fromMock });

		const res = await supertest(app.server)
			.put(`/actions/${idParam.id}`)
			.send(updatePayload);

		expect(res.status).toBe(500);
		expect(res.body).toHaveProperty("error");
		expect(res.body.error).toContain("Erro interno do servidor");

		// Restaura console.error
		consoleSpy.mockRestore();
	});
});
