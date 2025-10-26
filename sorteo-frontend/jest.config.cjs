// jest.config.cjs
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  
  rootDir: './', 
  testMatch: ['<rootDir>/tests/**/*.test.ts'], 
  modulePaths: ['<rootDir>/src'], 

  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/interfaces.ts',
    '!src/errors.ts',
  ],
};