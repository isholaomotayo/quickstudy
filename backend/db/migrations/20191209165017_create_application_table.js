exports.up = knex =>
  knex.schema.hasTable("application").then(exists => {
    if (!exists) {
      return knex.schema.createTable("application", table => {
        table.bigincrements();
        table.string("name").notNullable();
        table.string("description").nullable();

        table
          .integer("fee_id")
          .unsigned()
          .index()
          .references("id")
          .inTable("fee");
        table
          .integer("institution_id")
          .unsigned()
          .index()
          .references("id")
          .inTable("institution");

        table
          .integer("session_id")
          .unsigned()
          .index()
          .references("id")
          .inTable("session");
        table.timestamps(true);
        table
          .integer("created_by")
          .unsigned()
          .index()
          .references("id")
          .inTable("user");
        table
          .integer("updated_by")
          .unsigned()
          .index()
          .references("id")
          .inTable("user");
      });
    }
    return true;
  });

exports.down = knex => knex.schema.dropTableIfExists("application");
