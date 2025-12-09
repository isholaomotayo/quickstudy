exports.up = knex =>
knex.schema.hasTable('institution').then(exists => {
    if (exists) {
        return knex.schema.table('institution', function(table) {
            table.boolean('paywall_on').defaultTo(false)
        });
    }
    return true;
});

exports.down = knex =>
knex.schema.table('institution', function(table) {
    table.dropColumn('paywall_on')
});
