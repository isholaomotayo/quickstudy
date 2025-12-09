
exports.up = knex =>
knex.schema.hasTable('course_test').then(exists => {
    if (!exists) {
        return knex.schema.createTable('course_test', table => {
            table.increments('id').primary().unsigned();
            table.integer('course_id').references('course.id').nullable();
            table.integer('course_module_id').references('course_module.id').nullable();
            table.integer('course_lesson_id').references('course_lesson.id').nullable();
            table.string('name').notNullable();
            table.text('instructions').nullable();
            table.integer('duration_mins').unsigned().nullable();
            table.datetime('deadline').nullable();
            table.integer('max_attempts').unsigned().nullable().defaultTo(1);
            table.integer('max_score').nullable().defaultTo(0);
            table.timestamps(false, true);
        }).createTable('course_question', table => {
            table.increments('id').primary().unsigned();
            table.integer('course_test_id').references('course_test.id');
            table.string('question').notNullable();
            table.text('details').nullable();
            table.json('options').nullable();   // {"a":{"text":"First option", "is_answer":false}}
            table.string('answer').nullable().defaultTo('');
            table.integer('order').unsigned().notNullable();
            table.integer('marks').notNullable().defaultTo(1);
            table.timestamps(false, true);
        });
    }
    return true;
});

exports.down = knex => {
    return knex.schema.dropTable('course_question')
        .dropTable('course_test');
}
