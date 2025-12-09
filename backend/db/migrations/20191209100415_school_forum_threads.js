/**
 * ForumThread Migration
 */
exports.up = knex =>
  knex.schema.hasTable("school_forum_thread").then(exists => {
    if (!exists) {
      return knex.schema.createTable("school_forum_thread", table => {
        table
          .bigincrements("id")
          .primary()
          .unsigned();
        table
          .bigInteger("user_id")
          .unsigned()
          .references("id")
          .inTable("user")
          .notNullable();
        table
          .bigInteger("school_forum_topic_id")
          .unsigned()
          .references("id")
          .inTable("school_forum_topic")
          .notNullable();
        table.text("body").notNullable();
        table.timestamps();
      });
    }
    return true;
  });

exports.down = knex => knex.schema.dropTableIfExists("school_forum_thread");
