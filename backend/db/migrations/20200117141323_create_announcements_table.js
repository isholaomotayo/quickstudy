/**
 * ClassForum Migration
 */
exports.up = knex =>
  knex.schema.hasTable("announcements").then(exists => {
    if (!exists) {
      return knex.schema.createTable("announcements", table => {
        table
          .bigincrements("id")
          .primary()
          .unsigned();

          table
          .bigInteger("institution_id")
          .unsigned()
          .references("id")
          .inTable("institution")
          .notNullable();
        table
          .bigInteger("user_id")
          .unsigned()
          .references("id")
          .inTable("user")
          .notNullable();
        table.string("title").notNullable();
        table.text("body", "longtext").notNullable();
        table.timestamps();
      });
    }
    return true;
  });

exports.down = knex => knex.schema.dropTableIfExists("announcements");
