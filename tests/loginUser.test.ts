import { fastify } from 'fastify';
import { ZodTypeProvider, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import supertest from 'supertest';
import { db } from '@/db/connection';
import jwtPlugin from '@/plugins/jwt.ts'
import { verifyPassword } from '@/services/hash';
import { errorHandler } from '@/plugins/errors-handler';
import { generateTokens } from '@/services/handle-tokens';
import { loginUserRoute } from '@/http/routes/auth/login-user';

jest.mock('../env.ts', () => ({
    env: {
        JWT_SECRET: 'secret'
    }
}));


jest.mock('@/db/connection', () => ({
    db: {
        query: {
            users: {
                findFirst: jest.fn()
            }
        }
    }
}))

jest.mock('@/services/hash', () => ({
    verifyPassword: jest.fn(),
}))

jest.mock('@/services/handle-tokens', () => ({
    generateTokens: jest.fn(),
    revokeOldTokens: jest.fn()
}))

describe('POST /users/register - Success', () => {
    let app: ReturnType<typeof fastify>;

    beforeAll(async () => {

        app = fastify().withTypeProvider<ZodTypeProvider>()
        app.setValidatorCompiler(validatorCompiler)
        app.setSerializerCompiler(serializerCompiler)
        app.setErrorHandler(errorHandler)

        app.register(require('@fastify/cookie'));
        app.register(jwtPlugin, { secret: 'secret' })
        app.register(loginUserRoute)

        await app.ready();

        // criar usuário de teste
        await supertest(app.server).post('/users/register').send({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
        })
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks()
    });

    const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password',
    }

    it('should login successfully', async () => {
        (db.query.users.findFirst as jest.Mock).mockResolvedValue(user);
        (verifyPassword as jest.Mock).mockResolvedValue(true);
        (generateTokens as jest.Mock).mockResolvedValue({ accessToken: 'token', refreshToken: 'token' });

        const res = await supertest(app.server).post('/users/login').send({
            email: user.email,
            password: 'password123'
        })

        const cookie = res.headers['set-cookie'][0];

        expect(res.status).toBe(200)
        expect(res.body).toEqual({ accessToken: 'token' })
        expect(cookie).toMatch(/^refreshToken=token/)
        expect(cookie).toContain('HttpOnly')
        expect(cookie).toContain('Max-Age=604800')
        expect(cookie).toContain('Path=/users/refresh')
    })

    it('should be unexistent email', async () => {
        (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);
        (verifyPassword as jest.Mock).mockResolvedValue(true);

        const res = await supertest(app.server).post('/users/login').send({
            email: 'john@example.com',
            password: 'password123'
        })

        expect(res.status).toBe(401)
        expect(res.body).toEqual({ error: 'Não existe um usuário com este e-mail.' })

    })

    it('should be wrong password', async () => {
        (db.query.users.findFirst as jest.Mock).mockResolvedValue(user);
        (verifyPassword as jest.Mock).mockResolvedValue(false);

        const res = await supertest(app.server).post('/users/login').send({
            email: user.email,
            password: 'wrong-password'
        })

        console.log(res.body)

        expect(res.status).toBe(401)
        expect(res.body).toEqual({ error: 'Credenciais incorretas.' })
    })

    it('should return 500 on unexpected error', async () => {
        // Suprime o erro no console
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        // Simula erro ao tentar buscar o usuário no DB
        const fromMock = jest.fn().mockImplementation(() => {
            throw new Error('DB down');
        });
        (db.select as jest.Mock).mockReturnValue({ from: fromMock });

        (verifyPassword as jest.Mock).mockResolvedValue(true);

        const res = await supertest(app.server).post('/users/login').send({
            email: user.email,
            password: 'password123'
        })

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toContain('Erro interno do servidor');

        // Restaura console.error
        consoleSpy.mockRestore();
    })

})