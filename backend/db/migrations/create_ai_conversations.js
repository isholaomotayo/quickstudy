/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('ai_conversations', function (table) {
    table.increments('id').primary();
    table.string('user_id').notNullable();
    table.integer('context_id').nullable(); // lesson_id or module_id
    table.string('context_type').notNullable().defaultTo('lesson'); // 'lesson' or 'module'
    table.text('user_prompt').notNullable();
    table.text('ai_response').notNullable();
    table.json('lesson_data').nullable(); // Store lesson context data
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes for efficient queries
    table.index(['user_id', 'context_id'], 'idx_user_context');
    table.index(['user_id', 'created_at'], 'idx_user_created');
    table.index('created_at', 'idx_created_at');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('ai_conversations');
};