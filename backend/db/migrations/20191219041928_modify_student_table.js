exports.up = knex =>
  knex.schema.hasTable('student').then(exists => {
    if (exists) {
      return knex.schema.alterTable('student', function(table) {
        table
          .text('reg_no')
          .nullable()
          .alter();
      });
    }
    return true;
  });

exports.down = knex =>
  knex.schema.alterTable('student', function(table) {
    return true;
  });
