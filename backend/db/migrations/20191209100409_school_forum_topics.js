/**
 * Forumtopic Migration
 */
exports.up = knex =>
  knex.schema.hasTable("school_forum_topic").then(exists => {
    if (!exists) {
      return knex.schema.createTable("school_forum_topic", table => {
        table
          .bigincrements("id")
          .primary()
          .unsigned();
        table
          .bigInteger("school_forum_category_id")
          .unsigned()
          .references("id")
          .inTable("school_forum_category");

        table
          .bigInteger("user_id")
          .unsigned()
          .references("id")
          .inTable("user")
          .notNullable();
        table.string("title").notNullable();
        table.text("body").notNullable();
        table.timestamps();
      });
    }
    return true;
  });

exports.down = knex => knex.schema.dropTableIfExists("school_forum_topic");
