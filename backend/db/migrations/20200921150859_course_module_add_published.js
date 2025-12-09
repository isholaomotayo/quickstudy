exports.up = knex =>
knex.schema.hasTable('course_module').then(exists => {
    if (exists) {
        return knex.schema.table('course_module', function(table) {
            table.boolean('published').defaultTo(true)
        });
    }
    return true;
});

exports.down = knex =>
knex.schema.table('course_module', function(table) {
    table.dropColumn('published')
});
