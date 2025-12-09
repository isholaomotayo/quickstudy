exports.up = knex =>
knex.schema.hasTable('student_test').then(exists => {
    if (exists) {
        return knex.schema.table('student_test', function(table) {
            table.string('format').notNullable().defaultTo('');
        });
    }
    return true;
});

exports.down = knex =>
knex.schema.table('student_test', function(table) {
    table.dropColumn('format');
});
