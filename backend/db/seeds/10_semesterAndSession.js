exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("session")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("session").insert([
        {
          id: 1,
          name: "2019/2020",
          start_year: 2019,
          end_year: 2020
        }
      ]);
    })
    .then(function() {
      return knex("semester")
        .del()
        .then(function() {
          // Inserts seed entries
          return knex("semester").insert([
            {
              id: 1,
              name: "First Semester",
              session_id: 1,
              start_date: 2019,
              end_date: 2020,
              position: 1,
              institution_id: 1,
              is_active: true
            },
            {
              id: 2,
              name: "Second Semester",
              session_id: 1,
              start_date: 2019,
              end_date: 2020,
              institution_id: 1,
              position: 2
            },
            {
              id: 3,
              name: "Third Semester",
              session_id: 1,
              start_date: 2019,
              end_date: 2020,
              institution_id: 1,
              position: 3
            }
          ]);
        });
    });
};
