
exports.up = knex =>
knex.schema.hasTable('staff').then(exists => {
  if (exists) {
    return knex.schema.table('staff', function(table) {
      table.text('address').nullable();
      table.text('level').nullable();
      table.text('designation').nullable();
    });
  }
  return true;
});

exports.down = knex =>
knex.schema.table('staff', function(table) {
  table.dropColumn('designation');
  table.dropColumn('level');
  table.dropColumn('address');
});
