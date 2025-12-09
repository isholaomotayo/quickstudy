
exports.up = knex =>
knex.schema.hasTable('country').then(exists => {
    if (!exists) {
        return knex.schema.createTable('country', table => {
            table.increments();
            table.string('name').notNullable();
        });
    }
    return true;
    });

exports.down = knex => knex.schema.dropTableIfExists('country');

