exports.up = knex =>
knex.schema.hasTable('class_degree').then(exists => {
if (exists) {
    return knex.schema.alterTable('class_degree', function(table) {
    table.decimal('min_point').notNullable().alter();;
    table.decimal('max_point').notNullable().alter();;
    });
}
return true;
});

exports.down = knex =>
knex.schema.alterTable('class_degree', function(table) {
table
    .integer('max_point')
    .notNullable()
    .alter();
table
    .integer('min_point')
    .notNullable()
    .alter();
});
