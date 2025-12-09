exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("class_degree")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("class_degree").insert([
        {
          name: "First Class Honours",
          code: "FIRST",
          min_point: "4.50",
          max_point: "5.00",
          institution_id: "1",
        },
        {
          name: "Second Class Honours (Upper Division)",
          code: "SECOND_UPPER",
          min_point: "3.50",
          max_point: "4.49",
          institution_id: "1",
        },
        {
          name: "Second Class Honours (Lower Division)",
          code: "SECOND_LOWER",
          min_point: "2.50",
          max_point: "3.49",
          institution_id: "1",
        },
        {
          name: "Third Class Honours",
          code: "THIRD",
          min_point: "1.50",
          max_point: "2.49",
          institution_id: "1",
        },
        {
          name: "Pass",
          code: "PASS",
          min_point: "1.00",
          max_point: "1.49",
          institution_id: "1",
        },
        {
          name: "Fail",
          code: "FAIL",
          min_point: "0.00",
          max_point: "0.99",
          institution_id: "1",
        },
      ]);
    });
};
