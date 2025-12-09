
exports.up = knex =>
    knex.schema.hasTable('session').then(exists => {
        if (!exists) {
            return knex.schema.createTable('session', table => {
                table.increments();
                table.string('name').notNullable();
                table.string('start_year').notNullable();
                table.string('end_year').notNullable();
            });
        }
        return true;
    });

exports.down = knex => knex.schema.dropTableIfExists('session');

