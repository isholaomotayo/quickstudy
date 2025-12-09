exports.up = knex =>
  knex.schema.hasTable("fee_student_payment_frequency").then(exists => {
    if (!exists) {
      return knex.schema.createTable("fee_student_payment_frequency", table => {
        table.bigincrements();
        table
          .integer("fee_student_id")
          .unsigned()
          .index()
          .references("id")
          .inTable("fee_student");
        table
          .integer("student_id")
          .unsigned()
          .index()
          .references("id")
          .inTable("student");
        table
          .enu("payment_plan", [
            "PAY IN FULL",
            "PER SESSION",
            "PER SEMESTER",
            "MONTHLY",
            "CHANGED PLAN"
          ])
          .defaultTo("PER SEMESTER");

        table.decimal("payment_amount", 40, 2).defaultTo(0.0);
        table.decimal("total_amount", 40, 2).defaultTo(0.0);
        table.decimal("outstanding_amount", 40, 2).defaultTo(0.0);
        table.integer("status").defaultTo(0);

        table.timestamps(true);
        table
          .integer("created_by")
          .unsigned()
          .index()
          .references("id")
          .inTable("user");
        table
          .integer("updated_by")
          .unsigned()
          .index()
          .references("id")
          .inTable("user");
      });
    }
    return true;
  });

exports.down = knex =>
  knex.schema.dropTableIfExists("fee_student_payment_frequency");
