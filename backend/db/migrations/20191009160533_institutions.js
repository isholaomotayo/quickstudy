exports.up = knex =>
    knex.schema.hasTable('institution').then(exists => {
        if (!exists) {
            return knex.schema.createTable('institution', table => {
                table.increments('id').primary().unsigned();
                table.string('code').notNullable();
                table.string('name').notNullable();
                table.string('address').notNullable();
                table.string('email').unique().notNullable();
                table.string('phone').notNullable();
                table.string('motto').nullable();
                table.string('website').nullable();
                table.string('twitter').nullable();
                table.string('facebook').nullable();
                table.string('youtube').nullable();
                table.text('description').nullable();
                table.timestamps(false, true);
            });
        }
        return true;
    });

exports.down = knex => knex.schema.dropTable('institution');
