
exports.up = knex => 
    knex.schema.hasTable('result_batch').then(exists => {
        if (!exists) {
            return knex.schema.createTable('result_batch', table => {
                
                table.bigincrements('id').primary().unsigned();
                table.string('result_file').notNullable();
                table.integer('course_id').notNullable();
                table.integer('semester_id').unsigned().index().references('id').inTable('semester');
                table.boolean('approved').notNullable().default(0);
                table.boolean('publish').notNullable().default(0);
                table.boolean('active').notNullable().default(0);
                table.timestamps(true,true);
                table.integer('created_by').unsigned().index().references('id').inTable('user');
                table.integer('updated_by').unsigned().index().references('id').inTable('user');
            });
        }
        return true;
    });


exports.down = knex => knex.schema.dropTableIfExists('result_batch');

