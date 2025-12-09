
exports.up = knex =>
knex.schema.hasTable('programme_course').then(exists => {
  if (exists) {
    return knex.schema.table('programme_course', function(table) {
      table.integer('semester_position');
    });
  }
  return true;
});

exports.down = knex =>
knex.schema.table('programme_course', function(table) {
  table.dropColumn('semester_position');
});
