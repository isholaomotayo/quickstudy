exports.up = knex =>
  knex.schema.hasTable("fee_student_payment").then(exists => {
    if (!exists) {
      return knex.schema.createTable("fee_student_payment", table => {
        table.bigincrements();
        table
          .integer("fee_student_payment_frequency_id")
          .unsigned()
          .index()
          .references("id")
          .inTable("fee_student_payment_frequency");

        table.string("transaction_id").notNullable();
        table.string("reference").notNullable();
        table.decimal("amount", 40, 2).defaultTo(0.0);
        table.decimal("transaction_amount", 40, 2).defaultTo(0.0);
        table.string("transaction_ref").nullable();
        table.string("transaction_datetime").nullable();
        table.string("transaction_status").nullable();
        table.string("checksum").nullable();

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

exports.down = knex => knex.schema.dropTableIfExists("fee_student_payment");
