exports.up = knex =>
    knex.schema.hasTable("payment2").then(exists => {
        if (!exists) {
        return knex.schema
            .createTable("payment2", table => {
            table
                .increments("id")
                .primary()
                .unsigned();
            table
                .integer("student_id")
                .unsigned()
                .references("student.id")
                .notNullable();
            table
                .decimal("amount", 20, 2)
                .notNullable();
            table.json("cart").nullable();   // {"3":{"name": "MBA School Fees", "qty":4, "unit_price":22900, "fee_plan": "monthly", "fee_from": "2020-02-08"}, ...}
            table
                .integer("institution_id")
                .unsigned()
                .references("institution.id");
            table
                .integer("department_id")
                .unsigned()
                .references("department.id");
            table.string("processor").nullable();
            table.string("reference").nullable();
            table.string("ip").nullable();
            table
                .integer("status")
                .unsigned()
                .defaultTo(0);
            table.timestamps(false, true);
            table.datetime("paid_at").nullable();
            table.string("channel").nullable();
            table.string("processor_currency").nullable();
            table.string("processor_status").nullable();
            })
        }
    return true;
    });

exports.down = knex => {
    return knex.schema.dropTable("payment2");
};
