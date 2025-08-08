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
	},
}));

describe("GET /actions - Success", () => {
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

	it("should return a list of actions", async () => {
		// Simula a cadeia de chamadas da query do Drizzle
		const orderByMock = jest.fn().mockResolvedValue([
			{
				id: 1,
				action: "create_user",
				created_at: new Date("2024-01-01T00:00:00Z"),
				modified_at: new Date("2024-01-02T00:00:00Z"),
				created_by: {
					id: 10,
					name: "Admin",
				},
				modified_by: {
					id: 20,
					name: "Editor",
				},
				deleted: false,
			},
		]);
		const leftJoinMock2 = jest.fn(() => ({ orderBy: orderByMock }));
		const leftJoinMock1 = jest.fn(() => ({ leftJoin: leftJoinMock2 }));
		const fromMock = jest.fn(() => ({ leftJoin: leftJoinMock1 }));
		(db.select as jest.Mock).mockReturnValue({ from: fromMock });

		const response = await supertest(app.server).get("/actions");

		expect(response.status).toBe(200);
		expect(response.body).toEqual([
			{
				id: 1,
				action: "create_user",
				created_at: "2024-01-01T00:00:00.000Z",
				modified_at: "2024-01-02T00:00:00.000Z",
				created_by: {
					id: 10,
					name: "Admin",
				},
				modified_by: {
					id: 20,
					name: "Editor",
				},
				deleted: false,
			},
		]);
	});

    it("should return 500 on internal error", async () => {
		(db.select as jest.Mock).mockImplementation(() => {
			throw new Error("Unexpected error");
		});

		const response = await supertest(app.server).get("/actions");

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ error: "Internal server error" });
	});

    it("should return 400 on Zod validation error", async () => {
        const orderByMock = jest.fn().mockResolvedValue([
			{
				id: "invalid", // inválido int
				action: "create_user",
				created_at: "2024-01-01T00:00:00Z",
				modified_at: "2024-01-02T00:00:00Z",
				created_by: {
					id: 10,
					name: "Admin",
				},
				modified_by: {
					id: 20,
					name: "Editor",
				},
				deleted: false,
			},
		]);

        const leftJoinMock2 = jest.fn(() => ({ orderBy: orderByMock }));
        const leftJoinMock1 = jest.fn(() => ({ leftJoin: leftJoinMock2 }));
        const fromMock = jest.fn(() => ({ leftJoin: leftJoinMock1 }));

        (db.select as jest.Mock).mockReturnValue({ from: fromMock });

        const response = await supertest(app.server).get("/actions");

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(typeof response.body.error).toBe("string");

    })
});
