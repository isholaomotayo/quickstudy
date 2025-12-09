exports.up = function(knex) {
  return knex.schema.createTable('course_meetings', function(table) {
    table.increments('id').primary();
    table.integer('course_id').unsigned().notNullable();
    table.string('course_code').notNullable();
    table.string('meeting_provider').notNullable(); // 'googlemeet', 'jitsi', 'bbb'
    table.string('meeting_url').notNullable();
    table.string('meeting_id').nullable(); // External meeting ID
    table.text('meeting_data').nullable(); // JSON data for meeting details
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_persistent').defaultTo(false);
    table.datetime('expires_at').nullable();
    table.timestamps(true, true);

    // Foreign key constraint
    table.foreign('course_id').references('course.id').onDelete('CASCADE');
    
    // Indexes
    table.index(['course_id']);
    table.index(['course_code']);
    table.index(['meeting_provider']);
    table.index(['is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('course_meetings');
};