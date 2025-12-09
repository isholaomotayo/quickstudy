exports.up = knex =>
  knex.schema.hasTable('grade').then(exists => {
    if (!exists) {
      return knex.schema.createTable('grade', table => {
        table.increments();
        table.string('name').notNullable();
        table.integer('weight').nullable();
        table.integer('min_score').nullable();
        table.integer('max_score').nullable();
        table
          .integer('institution_id')
          .nullable()
          .unsigned()
          .index()
          .references('id')
          .inTable('institution');
      });
    }
    return true;
  });

exports.down = knex => knex.schema.dropTableIfExists('grade');
