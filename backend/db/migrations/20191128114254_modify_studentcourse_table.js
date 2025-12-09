exports.up = knex =>
  knex.schema.hasTable('student_course').then(exists => {
    if (exists) {
      return knex.schema.alterTable('student_course', function(table) {
        table
          .integer('credit_unit')
          .defaultTo(0)
          .alter();
        table.renameColumn('credit_unit', 'units');
      });
    }
    return true;
  });

exports.down = knex =>
  knex.schema.alterTable('student_course', function(table) {
    
    table
      .string('units')
      .nullable()
      .alter();
    table.renameColumn('units', 'credit_unit');
    
  });
