exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("user")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("user").insert([
        {
          id: 1,
          institution_id: 1,
          username: "omotayo",
          password:
            "$2b$10$uVa1yEgC2PszR1EDXPGQEOf9bsbR.HZOivSkHlbqASZUe746DZsU2",
          first_name: "Omotayo",
          last_name: "Ishola",
          other_name: "",
          email: "tayo@emergingplatforms.com",
          phone: "08033387594",
          active: 1,
          admin: 1,
          reset_code: "",
          avatar: "",
          personal_info: "",
          registration_source: "",
          enable_contact_me: 0,
          role: "SUPERADMIN"
        }
      ]);
    });
};
