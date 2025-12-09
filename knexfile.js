const path = require("path");

// Always load environment variables
require("dotenv").config({});

const pool = {
  min: 0,
  max: 1,
  acquireTimeoutMillis: 30000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 100,
};

const baseConfig = {
  client: "pg",
  searchPath: ["knex", "public"],
  ssl: { rejectUnauthorized: false },
  pool: pool,
  acquireConnectionTimeout: 30000,
  migrations: {
    directory: path.resolve(__dirname, "backend/db/migrations"),
  },
  seeds: {
    directory: path.resolve(__dirname, "backend/db/seeds"),
  },
};

const configs = {
  development: {
    ...baseConfig,
    connection:
      process.env.DATABASE_URL_DEV ||
      "postgres://postgres@localhost:5432/unn_ilearn",
  },

  preview: {
    ...baseConfig,
    connection:
      process.env.DATABASE_URL ||
      "postgres://postgres@localhost:5432/unn_ilearn",
  },

  production: {
    ...baseConfig,
    connection: process.env.DATABASE_URL,
  },
};

// Export all configs for knex CLI tools
module.exports = configs;

// Also export the current environment config as default
const currentEnv = process.env.NODE_ENV || "development";
module.exports.default = configs[currentEnv];
