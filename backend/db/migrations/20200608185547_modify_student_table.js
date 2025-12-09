exports.up = knex =>
  knex.schema.hasTable("student").then(exists => {
    if (exists) {
      return knex.schema.alterTable("student", function(table) {
        table.specificType("inst_cert", "text[]").alter();
      });
    }
    return true;
  });

exports.down = knex =>
  knex.schema.alterTable("student", function(table) {
    return true;
  });
