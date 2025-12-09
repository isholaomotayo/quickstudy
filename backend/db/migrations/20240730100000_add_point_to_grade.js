exports.up = function (knex) {
  return knex.schema.table("grade", function (table) {
    // Add a numeric column for grade points, e.g., A=5.00, B=4.00
    // Using decimal for precision, matching your GPA columns.
    table.decimal("point", 3, 2).defaultTo(0.0);
  });
};

exports.down = function (knex) {
  return knex.schema.table("grade", function (table) {
    table.dropColumn("point");
  });
};
