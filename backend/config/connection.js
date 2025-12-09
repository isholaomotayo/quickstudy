const path = require("path");

// Load environment variables
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({});
}
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

// Unified knex configuration
const unifiedConfig = {
  development: {
    client: "pg",
    connection:
      process.env.DATABASE_URL_DEV ||
      "postgres://postgres@localhost:5432/unn_ilearn",
    searchPath: ["knex", "public"],
    ssl: { rejectUnauthorized: false },
    pool: pool,
    acquireConnectionTimeout: 30000,
    migrations: {
      directory: path.resolve(__dirname, "../db/migrations"),
    },
    seeds: {
      directory: path.resolve(__dirname, "../db/seeds"),
    },
  },
  production: {
    client: process.env.DB_CLIENT || "pg",
    connection: process.env.DATABASE_URL,
    searchPath: ["knex", "public"],
    ssl: { rejectUnauthorized: false },
    pool: pool,
    acquireConnectionTimeout: 30000,
    migrations: {
      directory: path.resolve(__dirname, "../db/migrations"),
    },
    seeds: {
      directory: path.resolve(__dirname, "../db/seeds"),
    },
  },
};

// Select config based on NODE_ENV
const env = process.env.NODE_ENV || "development";
const knexConfig = unifiedConfig[env];

// Export config for migration/seeding tools
module.exports = {
  knexConfig,
  knex: require("knex")(knexConfig),
  Bookshelf: require("bookshelf")(require("knex")(knexConfig)).plugin(
    require("bookshelf-paranoia")
  ),
};

const knex = require("knex")(knexConfig);

exports.Bookshelf = require("bookshelf")(knex).plugin(
  require("bookshelf-paranoia")
);
exports.knex = knex;
