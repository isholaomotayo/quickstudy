
exports.up = knex =>
    knex.schema.hasTable('course_module').then(exists => {
        if (!exists) {
            return knex.schema.createTable('course_module', table => {
                table.increments('id').primary().unsigned();
                table.integer('course_id').references('course.id');
                table.string('name').notNullable();
                table.integer('order').unsigned().notNullable();
                table.text('description').nullable();
                table.timestamps(false, true);
            });
        }
        return true;
    });

exports.down = knex => knex.schema.dropTable('course_module');
