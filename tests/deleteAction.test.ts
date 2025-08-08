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

describe("DELETE /actions/:id - Success", () => {
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

	it("should delete a action with success", async () => {
		// Mock da cadeia onde a ação existe
		const whereMock = jest.fn().mockResolvedValueOnce([{ id: 1 }]);
		const fromMock = jest.fn(() => ({ where: whereMock }));
		(db.select as jest.Mock).mockReturnValue({ from: fromMock });

		// Mock da cadeia update().set().where().returning() para deletar a ação
		const returningMock = jest.fn().mockResolvedValue([{ id: 1 }]);
		const whereMock2 = jest.fn(() => ({ returning: returningMock }));
		const setMock = jest.fn(() => ({ where: whereMock2 }));
		const updateMock = jest.fn(() => ({ set: setMock }));
		(db.update as jest.Mock).mockImplementation(updateMock);

		const response = await supertest(app.server).delete(
			`/actions/${idParam.id}`,
		);

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			message: "Ação deletada com sucesso.",
		});
	});

	it("should return 404 if action does not exist", async () => {
		// Mock da cadeia onde a ação existe
		const whereMock = jest.fn().mockResolvedValueOnce([]);
		const fromMock = jest.fn(() => ({ where: whereMock }));
		(db.select as jest.Mock).mockReturnValue({ from: fromMock });

		// Mock da cadeia update().set().where().returning() para deletar a ação
		const returningMock = jest.fn().mockResolvedValue([{ id: 1 }]);
		const whereMock2 = jest.fn(() => ({ returning: returningMock }));
		const setMock = jest.fn(() => ({ where: whereMock2 }));
		const updateMock = jest.fn(() => ({ set: setMock }));
		(db.update as jest.Mock).mockImplementation(updateMock);

		const response = await supertest(app.server).delete(
			`/actions/${idParam.id}`,
		);

		expect(response.status).toBe(404);
		expect(response.body).toEqual({
			message: "Ação não encontrada.",
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

		const res = await supertest(app.server).delete(`/actions/${idParam.id}`);

		expect(res.status).toBe(500);
		expect(res.body).toHaveProperty("error");
		expect(res.body.error).toContain("Erro interno do servidor");

		// Restaura console.error
		consoleSpy.mockRestore();
	});
});
