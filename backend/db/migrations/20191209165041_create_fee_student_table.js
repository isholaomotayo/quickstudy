exports.up = knex =>
  knex.schema.hasTable("fee_student").then(exists => {
    if (!exists) {
      return knex.schema.createTable("fee_student", table => {
        table.bigincrements();
        table.string("name").notNullable();
        table.string("description").nullable();
        table.decimal("total_amount", 40, 2).defaultTo(0.0);
        table.decimal("paid_fees", 40, 2).defaultTo(0);
        table
          .integer("student_id")
          .unsigned()
          .index()
          .references("id")
          .inTable("student");
        table
          .integer("semester_id")
          .unsigned()
          .index()
          .references("id")
          .inTable("semester");
        table
          .enu("payment_plan", [
            "PAY IN FULL",
            "PER SESSION",
            "PER SEMESTER",
            "MONTHLY"
          ])
          .defaultTo("PER SEMESTER");

        table.jsonb("fees").defaultTo("[]");
        table
          .integer("fee_id")
          .unsigned()
          .index()
          .references("id")
          .inTable("fee");
        table.timestamps(true);
      });
    }
    return true;
  });

exports.down = knex => knex.schema.dropTableIfExists("fee_student");
