exports.up = knex =>
  knex.schema.hasTable('institution').then(exists => {
    if (exists) {
      return knex.schema.alterTable('institution', function(table) {
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
  knex.schema.table('institution', function(table) {
    table.dropColumn('created_by');
    table.dropColumn('updated_by');
  });
