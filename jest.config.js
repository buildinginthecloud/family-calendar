module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/handler/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@constructs/(.*)$': '<rootDir>/src/constructs/$1',
    '^@stacks/(.*)$': '<rootDir>/src/stacks/$1',
    '^@frontend/(.*)$': '<rootDir>/src/frontend/$1'
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react'
      }
    }
  },
  // Configure fast-check for property-based testing
  // Minimum 100 iterations per property test as specified in design document
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts']
};
