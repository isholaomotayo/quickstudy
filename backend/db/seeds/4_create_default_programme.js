exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("programme")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("programme").insert([
        {
          id: 1,
          department_id: 1,
          name: "Masters In Business Administration - Accounting ",
          years: 1,
          prefix: "MBA",
          description: "Accounting Option of Masters in Business Administration"
        },
        {
          id: 2,
          department_id: 2,
          name: "Masters In Business Administration - Banking & Finance",
          years: 1,
          prefix: "MBA",
          description:
            "Banking & Finance Option of Masters in Business Administration"
        },
        {
          id: 3,
          department_id: 3,
          name: "Masters In Business Administration - Marketing",
          years: 1,
          prefix: "MBA",
          description: "Marketing Option of Masters in Business Administration"
        },
        {
          id: 4,
          department_id: 4,
          name: "Masters In Business Administration - Management",
          years: 1,
          prefix: "MBA",
          description: "Management Option of Masters in Business Administration"
        }
      ]);
    });
};
