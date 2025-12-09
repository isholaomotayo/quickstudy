exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("faculty")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("faculty").insert([
        {
          id: 1,
          institution_id: "1",
          name: "Faculty of Business Administration",
          email: "ns@unn.edu.ng",
          phone: "08012345678",
          description:
            "The faculty of Business Administration,  university of Nsukka Nigeria"
        }
      ]);
    });
};
