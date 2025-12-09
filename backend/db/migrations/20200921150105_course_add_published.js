exports.up = knex =>
knex.schema.hasTable('course').then(exists => {
    if (exists) {
        return knex.schema.table('course', function(table) {
            table.boolean('published').defaultTo(true)
        });
    }
    return true;
});

exports.down = knex =>
knex.schema.table('course', function(table) {
    table.dropColumn('published')
});
