
exports.up = knex =>
    knex.schema.hasTable('course_lesson').then(exists => {
        if (!exists) {
            return knex.schema.createTable('course_lesson', table => {
                table.increments('id').primary().unsigned();
                table.integer('course_module_id').references('course_module.id');
                table.string('name').notNullable();
                table.integer('order').unsigned().notNullable();
                table.text('description').nullable();
                table.timestamps(false, true);
            });
        }
        return true;
    });

exports.down = knex => knex.schema.dropTable('course_lesson');
