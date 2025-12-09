module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    'backend/**/*.js',
    'helpers/**/*.js',
    '!backend/config/**',
    '!backend/models/**',
    '!**/node_modules/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // Mock modules that cause issues
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  }
};