/**
 * ClassForumThread Migration
 */
exports.up = knex =>
  knex.schema.hasTable("course_discussion_comment").then(exists => {
    if (!exists) {
      return knex.schema.createTable("course_discussion_comment", table => {
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
          .bigInteger("course_discussion_topic_id")
          .unsigned()
          .references("id")
          .inTable("course_discussion_topic")
          .notNullable();
        table.text("body", "longtext").nullable();
        table.timestamps();
      });
    }
    return true;
  });

exports.down = knex =>
  knex.schema.dropTableIfExists("course_discussion_comment");
