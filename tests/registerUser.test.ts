import { fastify } from 'fastify';
import { ZodTypeProvider, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import supertest from 'supertest';
import { db } from '@/db/connection';
import { hashPassword } from '@/services/hash';
import { errorHandler } from '@/plugins/errors-handler';
import { registerUserRoute } from '@/http/routes/auth/register-user';

jest.mock('@/db/connection', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

jest.mock('@/services/hash', () => ({
  hashPassword: jest.fn(),
}));


describe('POST /users/register - Success', () => {
  let app: ReturnType<typeof fastify>;

  beforeAll(async () => {
    app = fastify().withTypeProvider<ZodTypeProvider>()
    app.setValidatorCompiler(validatorCompiler)
    app.setSerializerCompiler(serializerCompiler)
    app.register(registerUserRoute)
    app.setErrorHandler(errorHandler)
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks()
  });

  const userPayload = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  };

  it('should register user successfully', async () => {

    // Mock db.select().from().where()
    const whereMock = jest.fn().mockResolvedValue([]);
    const fromMock = jest.fn(() => ({ where: whereMock }));
    (db.select as jest.Mock) = jest.fn(() => ({ from: fromMock }));

    // Mock db.insert(...).values(...)
    const valuesMock = jest.fn().mockResolvedValue(undefined);
    (db.insert as jest.Mock).mockReturnValue({ values: valuesMock });

    // Mock hashPassword
    (hashPassword as jest.Mock).mockResolvedValue('hashed-password');

    const res = await supertest(app.server).post('/users/register').send(userPayload);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      message: 'Usuário registrado com sucesso!',
      name: userPayload.name,
      email: userPayload.email,
    });
  });

  it('should fail if passwords do not match', async () => {
    const res = await supertest(app.server).post('/users/register').send({
      ...userPayload,
      confirmPassword: 'wrong-password',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Erro de validação');
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'confirmPassword', message: 'As senhas não são iguais.' })
      ])
    );
  });

  it('should fail if user already exists', async () => {
    const whereMock = jest.fn().mockResolvedValue([{ id: 1, email: 'john@example.com' }]);
    const fromMock = jest.fn(() => ({ where: whereMock }));
    (db.select as jest.Mock).mockReturnValue({ from: fromMock });

    (hashPassword as jest.Mock).mockResolvedValue('hashed-password');

    const userPayload = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const res = await supertest(app.server).post('/users/register').send(userPayload);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Já existe um usuário cadastrado com este e-mail.' });
  });

  it('should fail with validation error (invalid email)', async () => {
    const res = await supertest(app.server).post('/users/register').send({
      ...userPayload,
      email: 'invalid-email',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Erro de validação');
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email', message: 'Email inválido.' }),
      ])
    );
  });

  it('should return 500 on unexpected error', async () => {
    // Suprime o erro no console
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    // Simula erro ao tentar buscar o usuário no DB
    const fromMock = jest.fn().mockImplementation(() => {
      throw new Error('DB down');
    });
    (db.select as jest.Mock).mockReturnValue({ from: fromMock });

    (hashPassword as jest.Mock).mockResolvedValue('hashed-password');

    const userPayload = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const res = await supertest(app.server).post('/users/register').send(userPayload);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('Erro interno do servidor');

    // Restaura console.error
    consoleSpy.mockRestore();
  });
});
