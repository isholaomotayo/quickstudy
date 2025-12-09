exports.up = knex =>
knex.schema.hasTable('student_test').then(exists => {
    if (exists) {
        return knex.schema.table('student_test', function(table) {
            table.integer('institution_id').references('institution.id').notNullable()
            table.integer('department_id').references('department.id').notNullable()
            table.integer('marked_by').references('user.id').nullable()
            table.datetime('marked_at').nullable()
        });
    }
    return true;
});

exports.down = knex =>
knex.schema.table('student_test', function(table) {
    table.dropColumn('institution_id')
    table.dropColumn('department_id')
    table.dropColumn('marked_by')
    table.dropColumn('marked_at')
});
