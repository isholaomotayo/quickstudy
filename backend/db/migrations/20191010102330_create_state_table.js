
exports.up = knex =>
knex.schema.hasTable('state').then(exists => {
if (!exists) {
    return knex.schema.createTable('state', table => {
        table.increments();
        table.string('name').notNullable();
        table.string('code').nullable();
        table.integer('country_id').unsigned().index().references('id').inTable('country');
    });
}
return true;
});


exports.down = knex => knex.schema.dropTableIfExists('state');

