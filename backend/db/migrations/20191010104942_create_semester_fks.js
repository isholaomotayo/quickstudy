exports.up = knex =>
  knex.schema.hasTable('semester').then(exists => {
    if (exists) {
      return knex.schema.table('semester', function(table) {
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
  knex.schema.table('semester', function(table) {
    table.dropForeign('created_by');
    table.dropForeign('updated_by');
    table.dropForeign('institution_id');
    table.dropColumn('institution_id');
    table.dropColumn('created_by');
    table.dropColumn('updated_by');
  });
