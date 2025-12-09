exports.up = knex =>
  knex.schema.hasTable("school_forum_category").then(exists => {
    if (exists) {
      return knex.schema.table("school_forum_category", function(table) {
        table.string("institution_id").defaultTo(1);
      });
    }
    return true;
  });

exports.down = knex =>
  knex.schema.table("school_forum_category", function(table) {
    table.dropColumn("institution_id");
  });
