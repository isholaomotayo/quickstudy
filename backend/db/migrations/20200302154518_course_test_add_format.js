exports.up = knex =>
knex.schema.hasTable('course_test').then(exists => {
    if (exists) {
        return knex.schema.table('course_test', function(table) {
            table.enu('format', [ 'quiz', 'assignment', 'offline', '']).notNullable().defaultTo('');
        });
    }
    return true;
});

exports.down = knex =>
knex.schema.table('course_test', function(table) {
    table.dropColumn('format');
});
