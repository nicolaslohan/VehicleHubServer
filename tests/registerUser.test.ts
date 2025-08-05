import Fastify from 'fastify'
import supertest from 'supertest'
import { registerUserRoute } from '../src/http/auth/auth'

// Mock do db e hashPassword (mude os caminhos se necessário)
jest.mock('../src/db/connection', () => ({
  db: {
    insert: jest.fn()
  }
}))

jest.mock('../src/services/hash', () => ({
  hashPassword: jest.fn()
}))

import { db } from '../src/db/connection'
import { hashPassword } from '../src/services/hash'

describe('POST /users/register', () => {
  const app = Fastify()
  app.register(registerUserRoute)

  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should register user successfully', async () => {
    // Configura mocks
    (hashPassword as jest.Mock).mockResolvedValue('hashed-password')
      // Simula db.insert(...).values(...) retornando undefined (sucesso)
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      })

    const res = await supertest(app.server)
      .post('/users/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })

    expect(res.status).toBe(201)
    expect(res.body).toEqual({ message: 'Usuário registrado com sucesso!' })
    expect(hashPassword).toHaveBeenCalledWith('password123')
    expect(db.insert).toHaveBeenCalled()
  })

  it('should fail when passwords do not match', async () => {
    const res = await supertest(app.server)
      .post('/users/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'wrongpassword',
      })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'As senhas não são iguais.' })
    expect(hashPassword).not.toHaveBeenCalled()
    expect(db.insert).not.toHaveBeenCalled()
  })

  it('should return 400 if email already exists', async () => {
    (hashPassword as jest.Mock).mockResolvedValue('hashed-password')
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockRejectedValue(new Error('duplicate key value')),
      })

    const res = await supertest(app.server)
      .post('/users/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'Já existe um usuário cadastrado com este e-mail.' })
    expect(hashPassword).toHaveBeenCalled()
    expect(db.insert).toHaveBeenCalled()
  })
})
