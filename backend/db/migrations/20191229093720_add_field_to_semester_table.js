exports.up = knex =>
  knex.schema.hasTable('semester').then(exists => {
    if (exists) {
      return knex.schema.table('semester', function(table) {
        table.boolean('is_active').defaultTo(0);
      });
    }
    return true;
  });

exports.down = knex =>
  knex.schema.table('semester', function(table) {
    table.dropColumn('is_active');
  });
