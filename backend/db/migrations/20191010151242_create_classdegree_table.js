
exports.up = knex =>
    knex.schema.hasTable('class_degree').then(exists => {
        if (!exists) {
            return knex.schema.createTable('class_degree', table => {
                table.increments();
                table.string('name').notNullable();
                table.string('code').nullable();
                table.integer('min_point').notNullable();
                table.integer('max_point').notNullable();
                table.integer('institution_id').nullable().unsigned().index().references('id').inTable('institution');
            });
        }
        return true;
    });


exports.down = knex => knex.schema.dropTableIfExists('class_degree');

