exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("level")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("level").insert([
        { id: 1, name: "Pre MBA" },
        { id: 2, name: "First" },
        { id: 3, name: "Second" },
        { id: 4, name: "Third" },
        { id: 5, name: "Fourth" }
      ]);
    });
};
