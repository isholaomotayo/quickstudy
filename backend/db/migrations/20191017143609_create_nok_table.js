exports.up = knex =>
  knex.schema.hasTable('next_of_kin').then(exists => {
    if (!exists) {
      return knex.schema.createTable('next_of_kin', table => {
        table
          .bigincrements('id')
          .primary()
          .unsigned();

        table.string('nok_fname').nullable();
        table.string('nok_lname').nullable();
        table.string('nok_rel').nullable();
        table.string('nok_phone').nullable();
        table.text('nok_address').nullable();
        table
          .integer('user_id')
          .unsigned()
          .index()
          .references('id')
          .inTable('user');
        table.timestamps(true, true);
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
  });

exports.down = knex => knex.schema.dropTableIfExists('next_of_kin');
