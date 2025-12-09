exports.up = knex =>
knex.schema.hasTable('student_test').then(exists => {
    if (exists) {
        return knex.schema.table('student_test', function(table) {
            table.datetime('endtime').nullable();
            table.datetime('submitted_at').nullable();
        });
    }
    return true;
});

exports.down = knex =>
knex.schema.table('student_test', function(table) {
    table.dropColumn('endtime');
    table.dropColumn('submitted_at');
});
