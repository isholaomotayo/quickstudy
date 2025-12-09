exports.up = knex =>
knex.schema.hasTable('session').then(exists => {
    if (exists) {
        return knex.schema.table('session', function(table) {
            table.datetime('start_date').nullable()
            table.datetime('end_date').nullable()
            table.integer('institution_id').references('institution.id').nullable()
        });
    }
    return true;
});

exports.down = knex =>
knex.schema.table('session', function(table) {
    table.dropColumn('start_date')
    table.dropColumn('end_date')
    table.dropColumn('institution_id')
});
