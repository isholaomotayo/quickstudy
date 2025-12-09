exports.up = knex =>
  knex.schema.hasTable('payment_method').then(exists => {
    if (!exists) {
      return knex.schema.createTable('payment_method', table => {
        table.bigincrements();
        table.string('name').notNullable();
        table.string('logo').nullable();
        table.string('post_url').nullable();
        table.string('query_url').nullable();
        table.string('callback_url').nullable();
        table.string('webhook_url').nullable();

        table.timestamps(true);
      });
    }
    return true;
  });

exports.down = knex => knex.schema.dropTableIfExists('payment_method');
