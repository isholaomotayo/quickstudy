/**
 * ClassForumThread Migration
 */
exports.up = knex =>
  knex.schema.hasTable("course_forum_thread").then(exists => {
    if (!exists) {
      return knex.schema.createTable("course_forum_thread", table => {
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
          .bigInteger("course_forum_topic_id")
          .unsigned()
          .references("id")
          .inTable("course_forum_topic")
          .notNullable();
        table.text("body", "longtext").nullable();
        table.timestamps();
      });
    }
    return true;
  });

exports.down = knex => knex.schema.dropTableIfExists("course_forum_thread");
