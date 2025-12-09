exports.up = knex =>
  knex.schema.hasTable("student").then(exists => {
    if (exists) {
      return knex.schema.table("student", function(table) {
        table
          .enu("admission_status", ["ACTIVE", "PENDING", "DEFERRED"])
          .defaultTo("ACTIVE");
        table.enu("deferment_duration", ["SEMESTER", "YEAR"]).defaultTo(null);
        table.text("deferment_reason");
      });
    }
    return true;
  });

exports.down = knex =>
  knex.schema.table("student", function(table) {
    table.dropColumn("admission_status");
    table.dropColumn("deferment_duration");
    table.dropColumn("deferment_reason");
  });
