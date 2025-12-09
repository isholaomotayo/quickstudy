
exports.up = knex =>
knex.schema.hasTable('student').then(exists => {
  if (exists) {
    return knex.schema.table('student', function(table) {
      table.text('address').nullable();
    });
  }
  return true;
});

exports.down = knex =>
knex.schema.table('student', function(table) {
  table.dropColumn('address');
});
