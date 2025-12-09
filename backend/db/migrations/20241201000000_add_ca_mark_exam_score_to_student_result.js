exports.up = function (knex) {
  return knex.schema.table("student_result", function (table) {
    table
      .decimal("ca_mark", 5, 2)
      .nullable()
      .comment("Continuous Assessment Mark (0-30)");
    table
      .decimal("exam_score", 5, 2)
      .nullable()
      .comment("Examination Score (0-70)");
  });
};

exports.down = function (knex) {
  return knex.schema.table("student_result", function (table) {
    table.dropColumn("ca_mark");
    table.dropColumn("exam_score");
  });
};
