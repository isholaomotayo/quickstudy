exports.up = knex =>
  knex.schema.hasTable('semester').then(exists => {
    if (!exists) {
      return knex.schema.createTable('semester', table => {
        table.increments();
        table.string('name').notNullable();
        table
          .integer('session_id')
          .unsigned()
          .index()
          .references('id')
          .inTable('session');

        table.string('start_date').nullable();
        table.string('end_date').nullable();

        table.string('position').notNullable();

        table.timestamps(true, true);
      });
    }
    return true;
  });

exports.down = knex => knex.schema.dropTableIfExists('semester');
