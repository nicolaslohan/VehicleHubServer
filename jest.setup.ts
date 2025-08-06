jest.mock('./env.ts', () => ({
    env: {
        JWT_SECRET: 'secret'
    }
}));