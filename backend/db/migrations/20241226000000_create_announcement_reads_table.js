/**
 * Announcement Reads Migration - Track which users have read which announcements
 */
exports.up = knex =>
  knex.schema.hasTable("announcement_reads").then(exists => {
    if (!exists) {
      return knex.schema.createTable("announcement_reads", table => {
        table
          .bigincrements("id")
          .primary()
          .unsigned();

        table
          .bigInteger("announcement_id")
          .unsigned()
          .references("id")
          .inTable("announcements")
          .onDelete("CASCADE")
          .notNullable();

        table
          .bigInteger("user_id")
          .unsigned()
          .references("id")
          .inTable("user")
          .onDelete("CASCADE")
          .notNullable();

        table
          .bigInteger("institution_id")
          .unsigned()
          .references("id")
          .inTable("institution")
          .notNullable();

        table.timestamp("read_at").defaultTo(knex.fn.now());
        table.timestamps();

        // Ensure a user can only mark an announcement as read once
        table.unique(['announcement_id', 'user_id']);
        
        // Index for faster queries
        table.index(['user_id', 'announcement_id']);
        table.index(['announcement_id']);
      });
    }
    return true;
  });

exports.down = knex => knex.schema.dropTableIfExists("announcement_reads");