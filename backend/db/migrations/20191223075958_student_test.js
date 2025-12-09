
exports.up = knex =>
knex.schema.hasTable('student_test').then(exists => {
    if (!exists) {
        return knex.schema.createTable('student_test', table => {
            table.increments('id').primary().unsigned();
            table.integer('user_id').references('user.id').notNullable();
            table.integer('course_test_id').references('course_test.id').notNullable();
            table.string('test_name').notNullable();
            table.integer('duration_mins').unsigned().nullable();
            table.datetime('deadline').nullable();
            table.integer('attempt_number').unsigned().nullable();
            table.integer('max_attempts').unsigned().nullable();
            table.json('questions_answers').nullable();   // [{"A":{"text":"First option", "is_answer":false}}, ...]
            table.integer('score').nullable().defaultTo(0);
            table.integer('max_score').nullable().defaultTo(0);
            table.timestamps(false, true);
        });
    }
    return true;
});

exports.down = knex => {
    return knex.schema.dropTable('student_test')
}
