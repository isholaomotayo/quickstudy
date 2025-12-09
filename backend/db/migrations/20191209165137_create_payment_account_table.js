exports.up = knex =>
  knex.schema.hasTable('payment_account').then(exists => {
    if (!exists) {
      return knex.schema.createTable('payment_account', table => {
        table.bigincrements();
        table
          .integer('institution_id')
          .unsigned()
          .index()
          .references('id')
          .inTable('institution');
        table.string('merchant_id').nullable();
        table.string('terminal_id').nullable();
        table.string('secret_key').nullable();
        table.string('public_key').nullable();

        table.timestamps(true);
      });
    }
    return true;
  });

exports.down = knex => knex.schema.dropTableIfExists('payment_account');
