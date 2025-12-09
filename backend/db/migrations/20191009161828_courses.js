exports.up = knex =>
  knex.schema.hasTable("course").then(exists => {
    if (!exists) {
      return knex.schema
        .createTable("course", table => {
          table
            .increments("id")
            .primary()
            .unsigned();
          table
            .integer("programme_id")
            .unsigned()
            .references("programme.id");
          table.string("code").notNullable();
          table.string("name").notNullable();
          table
            .integer("level_id")
            .unsigned()
            .references("level.id");
          table.integer("units").notNullable();
          table.text("description").nullable();
          table.timestamps(false, true);
        })
        .createTable("programme_course", table => {
          table
            .increments("id")
            .primary()
            .unsigned();
          table
            .integer("programme_id")
            .unsigned()
            .references("programme.id");
          table
            .integer("course_id")
            .unsigned()
            .references("course.id");
          table
            .integer("level_id")
            .unsigned()
            .references("level.id");
          table.integer("units").nullable();
          table.timestamps(false, true);
        });
    }
    return true;
  });

exports.down = knex => {
  return knex.schema.dropTable("programme_course").dropTable("course");
};
