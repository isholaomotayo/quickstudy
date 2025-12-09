exports.up = knex =>
  knex.schema.hasTable("affiliate").then(exists => {
    if (exists) {
      return knex.schema.table("affiliate", function(table) {
        table.specificType("affiliate_paid", "text[]").defaultTo("{}");
      });
    }
    return true;
  });

exports.down = knex =>
  knex.schema.table("affiliate", function(table) {
    table.dropColumn("affiliate_paid");
  });
