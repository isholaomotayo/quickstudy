exports.up = knex =>
knex.schema.hasTable('course_test').then(exists => {
    if (exists) {
        return knex.schema.table('course_test', function(table) {
            table.boolean('published').defaultTo(true)
        });
    }
    return true;
});

exports.down = knex =>
knex.schema.table('course_test', function(table) {
    table.dropColumn('published')
});
