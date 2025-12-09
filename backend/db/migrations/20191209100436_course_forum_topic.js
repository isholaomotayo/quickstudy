/**
 * ClassForum Migration
 */
exports.up = knex =>
  knex.schema.hasTable("course_forum_topic").then(exists => {
    if (!exists) {
      return knex.schema.createTable("course_forum_topic", table => {
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
          .bigInteger("course_id")
          .unsigned()
          .references("id")
          .inTable("course")
          .notNullable();
        table.string("title").notNullable();
        table.text("description", "longtext").notNullable();
        table.timestamps();
      });
    }
    return true;
  });

exports.down = knex => knex.schema.dropTableIfExists("course_forum_topic");
