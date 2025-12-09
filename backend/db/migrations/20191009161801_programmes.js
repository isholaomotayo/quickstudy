exports.up = knex =>
    knex.schema.hasTable('programme').then(exists => {
        if (!exists) {
            return knex.schema.createTable('programme', table => {
                table.increments('id').primary().unsigned();
                table.integer('department_id').references('department.id');
                table.string('name').notNullable();
                table.integer('years').notNullable();
                table.string('prefix').nullable();
                table.text('description').nullable();
                table.timestamps(false, true);
            }).createTable('level', table => {
                table.increments('id').primary().unsigned();
                table.string('name').notNullable();
            });
        }
        return true;
    });

exports.down = knex => {
    return knex.schema.dropTable('programme')
        .dropTable('level');
}
