exports.up = knex =>
knex.schema.hasTable('student').then(exists => {
    if (exists) {
        return knex.schema.table('student', function(table) {
            table.string('fee_plan').defaultTo('')
        });
    }
    return true;
});

exports.down = knex =>
knex.schema.table('student', function(table) {
    table.dropColumn('fee_plan')
});
