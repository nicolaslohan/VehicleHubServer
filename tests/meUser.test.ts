import supertest from "supertest";
import { createTestServer } from "./server";

describe("GET /users/me", () => {
	let app: ReturnType<typeof createTestServer>;

	beforeAll(async () => {
		app = createTestServer({ mockAuth: true }); // habilita autenticação fake
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	it("should return the logged-in user", async () => {
		const res = await supertest(app.server).get("/users/me");

		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			user: {
				id: "user123",
				name: "Test User",
			},
		});
	});

	it("should return 401 if not authenticated", async () => {
		// Cria novo servidor sem mock de autenticação
		const unauthenticatedApp = createTestServer({ mockAuth: false });
		await unauthenticatedApp.ready();

		const res = await supertest(unauthenticatedApp.server).get("/users/me");

		expect(res.status).toBe(401);
		expect(res.body).toHaveProperty("error");
		expect(res.body.error.toLowerCase()).toMatch(
			/não autorizado|unauthorized|jwt/i,
		);

		await unauthenticatedApp.close();
	});

	// it("should return 500 on unexpected error", async () => {
	// 	// Cria app com autenticação mockada que lança erro
	// 	const appWithError = createTestServer({ mockAuth: true })

	// 	// Redefine o decorator para lançar erro
	// 	appWithError.decorate("authenticate", async () => {
	// 		throw new Error("Unexpected failure")
	// 	})

	// 	await appWithError.ready()

	// 	const res = await supertest(appWithError.server).get("/users/me")

	// 	expect(res.status).toBe(500)
	// 	expect(res.body).toHaveProperty("error")
	// 	expect(res.body.error).toContain("Erro interno do servidor")

	// 	await appWithError.close()
	// });
});
