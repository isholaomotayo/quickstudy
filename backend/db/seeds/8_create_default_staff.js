exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("staff")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("staff").insert([
        {
          id: 1,
          staff_no: "UNN/STF/0001",
          user_id: 1,
          dept_id: 1,
          address: "Enugu",
          gender: "Male",
          level: "Level 9",
          designation: "Orator/Reader"
        }
      ]);
    });
};
