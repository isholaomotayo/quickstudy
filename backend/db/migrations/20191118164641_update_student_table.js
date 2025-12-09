exports.up = knex =>
  knex.schema.hasTable('student').then(exists => {
    if (exists) {
      return knex.schema.table('student', function(table) {
        table
          .integer('programme_id')
          .unsigned()
          .index()
          .references('id')
          .inTable('programme');
      });
    }
    return true;
  });

exports.down = knex =>
  knex.schema.table('student', function(table) {
    table.dropColumn('programme_id');
  });
