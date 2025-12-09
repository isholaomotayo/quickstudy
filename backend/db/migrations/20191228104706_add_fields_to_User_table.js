exports.up = knex =>
  knex.schema.hasTable('user').then(exists => {
    if (exists) {
      return knex.schema.table('user', function(table) {
        table.text('referral_code').defaultTo('UNN');
      });
    }
    return true;
  });

exports.down = knex =>
  knex.schema.table('user', function(table) {
    table.dropColumn('referral_code');
  });
