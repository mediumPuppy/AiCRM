export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.test.ts'],
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1'
    },
    moduleDirectories: ['node_modules', 'src'],
    // Temporarily exclude specific test files
    testPathIgnorePatterns: [
      '/node_modules/',
    ]
};