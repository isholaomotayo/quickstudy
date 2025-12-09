exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("department")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("department").insert([
        {
          id: 1,
          faculty_id: 1,
          code: "ACC",
          name: "Department of Accounting",
          email: "acc@unn.edu.ng",
          phone: "+2349012345671",
          description:
            "The department of Accounting, Faculty of Business Administration, University of Nsukka"
        },
        {
          id: 2,
          faculty_id: 1,
          code: "MAC",
          name: "Department of Banking & Finance ",
          email: "mac@unn.edu.ng",
          phone: "+2349012345672",
          description:
            "The department of Banking & Finance, Faculty of Business Administration, University of Nsukka"
        },
        {
          id: 3,
          faculty_id: 1,
          code: "MKT",
          name: "Department of Marketing",
          email: "mkt@unn.edu.ng",
          phone: "+2349012345673",
          description:
            "The department of Marketing, Faculty of Business Administration, University of Nsukka"
        },
        {
          id: 4,
          faculty_id: 1,
          code: "MAN",
          name: "Department of Management ",
          email: "man@unn.edu.ng",
          phone: "+2349012345674",
          description:
            "The department of Management, Faculty of Business Administration, University of Nsukka"
        }
      ]);
    });
};
