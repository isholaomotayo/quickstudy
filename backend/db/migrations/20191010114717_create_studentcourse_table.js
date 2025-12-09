exports.up = knex =>
  knex.schema.hasTable('student_course').then(exists => {
    if (!exists) {
      return knex.schema.createTable('student_course', table => {
        table
          .bigincrements('id')
          .primary()
          .unsigned();

        table
          .integer('student_id')
          .unsigned()
          .index()
          .references('id')
          .inTable('student');
        table
          .integer('course_id')
          .nullable()
          .unsigned()
          .index();
        //   .references('id')
        //   .inTable('course');
        table
          .integer('semester_id')
          .nullable()
          .unsigned()
          .index()
          .references('id')
          .inTable('semester');
        table
          .integer('level_id')
          .nullable()
          .unsigned()
          .index();
        //   .references('id')
        //   .inTable('level');
        table.string('credit_unit').nullable();

        table
          .boolean('cleared')
          .notNullable()
          .defaultTo(0);
        table
          .boolean('approval_status')
          .notNullable()
          .defaultTo(0);
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

exports.down = knex => knex.schema.dropTableIfExists('student_course');
