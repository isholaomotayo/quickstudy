exports.up = (knex) =>
  knex.schema.hasTable("institution").then((exists) => {
    if (exists) {
      return knex.schema.table("institution", function (table) {
        table.text("token").nullable();
      });
    }
    return true;
  });

exports.down = (knex) =>
  knex.schema.table("institution", function (table) {
    table.dropColumn("token");
  });
