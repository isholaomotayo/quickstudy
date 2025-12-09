exports.up = knex =>
  knex.schema.hasTable("student").then(exists => {
    if (exists) {
      return knex.schema.alterTable("student", function(table) {
        table
          .integer("current_level_id")
          .nullable()
          .unsigned()
          .index()
          .references("id")
          .inTable("level");
      });
    }
    return true;
  });

exports.down = knex =>
  knex.schema.alterTable("student", function(table) {
    return true;
  });
