exports.up = knex =>
  knex.schema.hasTable('staff_course').then(exists => {
    if (!exists) {
      return knex.schema.createTable('staff_course', table => {
        table
          .bigincrements('id')
          .primary()
          .unsigned();

        table
          .integer('staff_id')
          .unsigned()
          .index()
          .references('id')
          .inTable('staff');
        table
          .integer('course_id')
          .nullable()
          .unsigned()
          .index();
        //.references('id').inTable('course');

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

exports.down = knex => knex.schema.dropTableIfExists('staff_course');
