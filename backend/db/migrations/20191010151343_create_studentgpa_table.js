
exports.up = knex =>
    knex.schema.hasTable('student_gpa').then(exists => {
        if (!exists) {
            return knex.schema.createTable('student_gpa', table => {
            
            table.bigincrements('id').primary().unsigned();
            
            table.integer('student_id').unsigned().index().references('id').inTable('student');
            table.integer('semester_id').unsigned().index().references('id').inTable('semester');
            table.integer('level_id').unsigned().index()
            // .references('id').inTable('level');

            table.integer('prev_tnu').nullable();
            table.integer('prev_tcp').nullable();
            table.decimal('prev_gpa').nullable();

            table.integer('current_tnu').nullable();
            table.integer('current_tcp').nullable();
            table.decimal('current_gpa').nullable();

            table.integer('cumulative_tnu').nullable();
            table.integer('cumulative_tcp').nullable();
            table.decimal('cumulative_gpa').nullable();

            table.integer('class_degree_id').unsigned().index().references('id').inTable('class_degree');
            table.timestamps(true,true);
            table.integer('created_by').unsigned().index().references('id').inTable('user');
            table.integer('updated_by').unsigned().index().references('id').inTable('user');
            });
        }
        return true;
        });


exports.down = knex => knex.schema.dropTableIfExists('student_gpa');
