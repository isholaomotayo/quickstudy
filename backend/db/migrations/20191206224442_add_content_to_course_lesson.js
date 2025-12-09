exports.up = knex =>
knex.schema.hasTable('course_lesson').then(exists => {
    if (exists) {
        return knex.schema.table('course_lesson', function(table) {
            table.text('content', 'mediumtext').notNullable().defaultTo('');
        });
    }
    return true;
});

exports.down = knex =>
knex.schema.table('course_lesson', function(table) {
    table.dropColumn('content');
});
