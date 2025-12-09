/**
 * ClassForum Migration
 */
exports.up = knex =>
  knex.schema.hasTable("course_discussion_topic").then(exists => {
    if (!exists) {
      return knex.schema.createTable("course_discussion_topic", table => {
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
        table.text("body", "longtext").notNullable();
        table.datetime("start_date").nullable();
        table.datetime("end_date").nullable();
        table.timestamps();
      });
    }
    return true;
  });

exports.down = knex => knex.schema.dropTableIfExists("course_discussion_topic");
