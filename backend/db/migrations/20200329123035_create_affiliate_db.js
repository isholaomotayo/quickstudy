exports.up = knex =>
  knex.schema.hasTable('affiliate').then(exists => {
    if (!exists) {
      return knex.schema.createTable('affiliate', table => {
        table
          .bigincrements('id')
          .primary()
          .unsigned();

        table
          .integer('user_id')
          .unsigned()
          .index()
          .references('id')
          .inTable('user');

        table.string('bank');
        table.string('account_no');

        table.timestamps(true, true);
      });
    }
    return true;
  });

exports.down = knex => knex.schema.dropTableIfExists('affiliate');
