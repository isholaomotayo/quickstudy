/**
 * Simplified Course Progress Tracking Migration
 *
 * This creates a single consolidated table to track all course progress,
 * replacing the fragmented approach with multiple tables.
 */

exports.up = function (knex) {
  return Promise.all([
    // Single consolidated course progress table
    knex.schema.createTable("course_progress", function (table) {
      table.increments("id").primary();

      // Core identifiers
      table.integer("student_id").unsigned().notNullable();
      table.integer("course_id").unsigned().notNullable();
      table.integer("course_module_id").unsigned().nullable(); // Current/active module
      table.integer("institution_id").unsigned().notNullable();

      // Progress data (JSON for flexibility)
      table.json("progress_data").nullable(); // Store all progress details
      table.json("user_preferences").nullable(); // Store user preferences

      // Quick access fields (for queries without JSON parsing)
      table.integer("total_lessons").defaultTo(0);
      table.integer("completed_lessons").defaultTo(0);
      table.decimal("completion_percentage", 5, 2).defaultTo(0.0);

      // Current position
      table.integer("current_lesson_id").unsigned().nullable();
      table.integer("last_lesson_id").unsigned().nullable();

      // Status and timing
      table
        .enum("status", ["not_started", "in_progress", "completed", "paused"])
        .defaultTo("not_started");
      table.timestamp("started_at").nullable();
      table.timestamp("completed_at").nullable();
      table.timestamp("last_accessed_at").nullable();

      // Time tracking
      table.integer("total_time_minutes").defaultTo(0);
      table.integer("session_count").defaultTo(0);

      // Timestamps
      table.timestamps(true, true);

      // Indexes and constraints
      table.unique(["student_id", "course_id"]);
      table
        .foreign("student_id")
        .references("id")
        .inTable("student")
        .onDelete("CASCADE");
      table
        .foreign("course_id")
        .references("id")
        .inTable("course")
        .onDelete("CASCADE");
      table
        .foreign("course_module_id")
        .references("id")
        .inTable("course_module")
        .onDelete("SET NULL");
      table
        .foreign("institution_id")
        .references("id")
        .inTable("institution")
        .onDelete("CASCADE");
      table
        .foreign("current_lesson_id")
        .references("id")
        .inTable("course_lesson")
        .onDelete("SET NULL");
      table
        .foreign("last_lesson_id")
        .references("id")
        .inTable("course_lesson")
        .onDelete("SET NULL");

      // Indexes for performance
      table.index(["student_id", "status"]);
      table.index(["course_id", "status"]);
      table.index(["institution_id"]);
      table.index(["last_accessed_at"]);
      table.index(["completion_percentage"]);
    }),

    // Optional: Simple session log table (if you want to track sessions)
    knex.schema.createTable("learning_sessions", function (table) {
      table.increments("id").primary();
      table.integer("student_id").unsigned().notNullable();
      table.integer("course_id").unsigned().notNullable();
      table.timestamp("session_start").notNullable();
      table.timestamp("session_end").nullable();
      table.integer("duration_minutes").defaultTo(0);
      table.json("session_data").nullable(); // Store session activities
      table.timestamps(true, true);

      table
        .foreign("student_id")
        .references("id")
        .inTable("student")
        .onDelete("CASCADE");
      table
        .foreign("course_id")
        .references("id")
        .inTable("course")
        .onDelete("CASCADE");
      table.index(["student_id", "session_start"]);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists("learning_sessions"),
    knex.schema.dropTableIfExists("course_progress"),
  ]);
};
