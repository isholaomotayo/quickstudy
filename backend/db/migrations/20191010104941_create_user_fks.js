exports.up = knex =>
  knex.schema.hasTable('user').then(exists => {
    if (exists) {
      return knex.schema.table('user', function(table) {
        table
          .integer('institution_id')
          .unsigned()
          .index()
          .references('id')
          .inTable('institution');
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

exports.down = knex =>
  knex.schema.table('user', function(table) {
    table.dropColumn('institution_id');
    table.dropColumn('created_by');
    table.dropColumn('updated_by');
  });
