exports.up = knex =>
  knex.schema.hasTable("user").then(exists => {
    if (exists) {
      return knex.schema.table("user", function(table) {
        table.boolean("account_active").defaultTo(true);
      });
    }
    return true;
  });

exports.down = knex =>
  knex.schema.table("user", function(table) {
    table.dropColumn("account_active");
  });
