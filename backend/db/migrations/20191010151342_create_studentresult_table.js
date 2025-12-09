exports.up = knex =>
  knex.schema.hasTable('student_result').then(exists => {
    if (!exists) {
      return knex.schema.createTable('student_result', table => {
        table
          .bigincrements('id')
          .primary()
          .unsigned();

        table
          .integer('student_course_id')
          .unsigned()
          .index()
          .references('id')
          .inTable('student_course');

        table.string('score').notNullable();
        table.decimal('cumulative_point');

        table
          .boolean('approved')
          .notNullable()
          .defaultTo(0);
        table
          .boolean('publish')
          .notNullable()
          .defaultTo(0);

        table
          .integer('grade_id')
          .nullable()
          .unsigned()
          .index()
          .references('id')
          .inTable('grade');

        table
          .integer('result_batch_id')
          .unsigned()
          .index()
          .references('id')
          .inTable('result_batch');

        table.timestamps(true, true);
        table
          .integer('created_by')
          .unsigned()
          .index()
          .references('id')
          .inTable('user');
        table
          .integer('updated_by')
          .unsigned()
          .index()
          .references('id')
          .inTable('user');
      });
    }
    return true;
  });

exports.down = knex => knex.schema.dropTableIfExists('student_result');
