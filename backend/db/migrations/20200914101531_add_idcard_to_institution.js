exports.up = knex =>
  knex.schema.hasTable("institution").then(exists => {
    if (exists) {
      return knex.schema.table("institution", function(table) {
        table.json("id_card").nullable();
      });
    }
    return true;
  });

exports.down = knex =>
  knex.schema.table("institution", function(table) {
    table.dropColumn("id_card");
  });
