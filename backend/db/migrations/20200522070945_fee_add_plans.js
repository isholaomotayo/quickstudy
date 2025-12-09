exports.up = knex =>
knex.schema.hasTable('fee').then(exists => {
    if (exists) {
        return knex.schema.table('fee', function(table) {
            table.decimal('monthly', 20, 2).nullable()
            table.integer('monthly_parts').nullable().defaultTo(0)
            table.decimal('semesterly', 20, 2).nullable()
            table.integer('semesterly_parts').nullable().defaultTo(0)
            table.decimal('sessionly', 20, 2).nullable()
            table.integer('sessionly_parts').nullable().defaultTo(0)
        });
    }
    return true;
});

exports.down = knex =>
knex.schema.table('fee', function(table) {
    table.dropColumn('monthly')
    table.dropColumn('semesterly')
    table.dropColumn('sessionly')
    table.dropColumn('monthly_parts')
    table.dropColumn('semesterly_parts')
    table.dropColumn('sessionly_parts')
});
