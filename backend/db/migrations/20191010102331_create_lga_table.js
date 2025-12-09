
exports.up = knex =>
knex.schema.hasTable('lga').then(exists => {
    if (!exists) {
        return knex.schema.createTable('lga', table => {
            table.increments();
            table.string('name').notNullable();
            table.integer('state_id').unsigned().index().references('id').inTable('state');
        });
    }
    return true;
    });


exports.down = knex => knex.schema.dropTableIfExists('lga');

