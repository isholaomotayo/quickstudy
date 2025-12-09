exports.up = knex =>
  knex.schema.hasTable("payment_account").then(exists => {
    if (exists) {
      return knex.schema.table("payment_account", function(table) {
        table.string("test_secret_key");
        table.string("test_public_key");
      });
    }
    return true;
  });

exports.down = knex =>
  knex.schema.table("payment_account", function(table) {
    table.dropColumn("test_secret_key");
    table.dropColumn("test_public_key");
  });
