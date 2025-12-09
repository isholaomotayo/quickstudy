exports.up = knex =>
knex.schema.hasTable('programme').then(exists => {
    if (exists) {
        return knex.schema.table('programme', function(table) {
            table.string('regno_format').defaultTo('')
        });
    }
    return true;
});

exports.down = knex =>
knex.schema.table('programme', function(table) {
    table.dropColumn('regno_format')
});
