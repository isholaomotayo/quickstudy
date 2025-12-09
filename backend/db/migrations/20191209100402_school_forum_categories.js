/**
 * Forum_category Migration
 */
exports.up = knex =>
  knex.schema.hasTable("school_forum_category").then(exists => {
    if (!exists) {
      return knex.schema.createTable("school_forum_category", table => {
        table
          .bigincrements("id")
          .primary()
          .unsigned();
        table.string("name").notNullable();
        table.timestamps();
      });
    }
    return true;
  });

exports.down = knex => knex.schema.dropTableIfExists("school_forum_category");
