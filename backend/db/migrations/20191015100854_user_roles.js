exports.up = knex =>
  knex.schema.hasTable("user_role").then(exists => {
    if (!exists) {
      return knex.schema.createTable("user_role", table => {
        table
          .bigincrements("id")
          .primary()
          .unsigned();

        table
          .enu("role", ["STUDENT", "FACULTY", "ADMIN", "SUPERADMIN"])
          .defaultTo("STUDENT");
        table
          .integer("user_id")
          .notNullable()
          .references("id")
          .inTable("user");
      });
    }
  });

exports.down = knex => knex.schema.dropTableIfExists("user_role");
