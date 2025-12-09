/**
 * Migration to drop unused tables
 * Tables: country, lga, next_of_kin, payment_method, result_batch, state, user_role
 * All tables have been verified to be empty before dropping
 */

exports.up = function (knex) {
  return (
    knex.schema
      // First drop foreign key constraints
      .raw(
        "ALTER TABLE IF EXISTS student_result DROP CONSTRAINT IF EXISTS student_result_result_batch_id_fkey"
      )
      .raw(
        "ALTER TABLE IF EXISTS staff DROP CONSTRAINT IF EXISTS staff_nationality_id_fkey"
      )
      .raw(
        "ALTER TABLE IF EXISTS staff DROP CONSTRAINT IF EXISTS staff_lga_id_fkey"
      )
      .raw(
        "ALTER TABLE IF EXISTS staff DROP CONSTRAINT IF EXISTS staff_state_origin_id_fkey"
      )
      .raw(
        "ALTER TABLE IF EXISTS student DROP CONSTRAINT IF EXISTS student_nationality_id_fkey"
      )
      .raw(
        "ALTER TABLE IF EXISTS student DROP CONSTRAINT IF EXISTS student_lga_id_fkey"
      )
      .raw(
        "ALTER TABLE IF EXISTS student DROP CONSTRAINT IF EXISTS student_state_origin_id_fkey"
      )
      .raw(
        "ALTER TABLE IF EXISTS state DROP CONSTRAINT IF EXISTS state_country_id_fkey"
      )
      .raw(
        "ALTER TABLE IF EXISTS lga DROP CONSTRAINT IF EXISTS lga_state_id_fkey"
      )
      // Then drop the tables in correct order (child tables first)
      .dropTableIfExists("user_role")
      .dropTableIfExists("result_batch")
      .dropTableIfExists("payment_method")
      .dropTableIfExists("next_of_kin")
      .dropTableIfExists("lga")
      .dropTableIfExists("state")
      .dropTableIfExists("country")
  );
};

exports.down = function (knex) {
  return knex.schema
    .createTable("country", function (table) {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.timestamps(true, true);
    })
    .createTable("state", function (table) {
      table.increments("id").primary();
      table.string("name").notNullable();
      table
        .integer("country_id")
        .unsigned()
        .references("id")
        .inTable("country");
      table.timestamps(true, true);
    })
    .createTable("lga", function (table) {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.integer("state_id").unsigned().references("id").inTable("state");
      table.timestamps(true, true);
    })
    .createTable("next_of_kin", function (table) {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("relationship");
      table.string("phone");
      table.string("address");
      table.timestamps(true, true);
    })
    .createTable("payment_method", function (table) {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("description");
      table.boolean("is_active").defaultTo(true);
      table.timestamps(true, true);
    })
    .createTable("result_batch", function (table) {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("description");
      table.date("start_date");
      table.date("end_date");
      table.timestamps(true, true);
    })
    .createTable("user_role", function (table) {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("description");
      table.boolean("is_active").defaultTo(true);
      table.timestamps(true, true);
    });
};
