module.exports = {
    setupFiles: ['./jest.setup.ts'],
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',  // ajuste o caminho conforme sua estrutura
    },
    transform: {
        '^.+\\.(t|j)sx?$': ['@swc/jest'],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testMatch: ['**/tests/**/*.test.ts'],
};