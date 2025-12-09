exports.up = (knex) =>
  knex.schema.hasTable("level").then((exists) => {
    if (exists) {
      return knex.schema.alterTable("level", function (table) {
        table.string("description").nullable().defaultTo("");
        table
          .integer("institution_id")
          .nullable()
          .unsigned()
          .index()
          .references("id")
          .inTable("institution")
          .defaultTo(1);
      });
    }
    return true;
  });

exports.down = (knex) =>
  knex.schema.alterTable("level", function (table) {
    return true;
  });
