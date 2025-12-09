// Test setup file
// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.API_URL = 'http://localhost:3000';

// Mock database config before any models are loaded
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'test';
process.env.DB_PASS = 'test';
process.env.DB_NAME = 'test';

// Mock the entire database connection module
jest.mock('../backend/config/connection', () => ({
  knexConfig: {
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'test',
      password: 'test',
      database: 'test'
    }
  },
  knex: {
    raw: jest.fn(),
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  Bookshelf: {
    Model: {
      extend: jest.fn(() => ({
        forge: jest.fn(),
        where: jest.fn(),
        fetchAll: jest.fn(),
        fetch: jest.fn(),
      }))
    },
    model: jest.fn()
  }
}));

// Global test utilities
global.console = {
  ...console,
  // Suppress console during tests but keep error for debugging
  log: jest.fn(),
  warn: jest.fn(),
  error: console.error, // Keep errors visible
};

// Mock fetch globally for tests
global.fetch = jest.fn();

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});