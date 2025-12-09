
exports.up = knex =>
knex.schema.hasTable('course').then(exists => {
  if (exists) {
    return knex.schema.table('course', function(table) {
      table.integer('semester_position');
      table.integer('department_id').nullable().unsigned().index().references('id').inTable('department');
    });
  }
  return true;
});

exports.down = knex =>
knex.schema.table('course', function(table) {
  table.dropColumn('semester_position');
  table.dropColumn('department_id');
});
