exports.seed = function(knex) {
  // Deletes ALL existing entries

  return knex
    .raw("TRUNCATE TABLE institution CASCADE;")

    .then(function() {
      // Inserts seed entries
      return knex("institution").insert([
        {
          id: 1,
          code: "UNN-CDeL",
          name: "University of Nsukka- Centre for Distant Learning",
          address: "Nsukka - Onitsha Rd, Nsukka",
          email: "http://mail.unn.edu.ng/",
          phone: "",
          motto: "To restore the dignity of man",
          website: "https://www.unn.edu.ng/",
          twitter: "https://twitter.com/unn_tweets",
          facebook: "http://www.facebook.com/universityofnigeria",
          youtube:
            "https://www.youtube.com/channel/UC7v8Y9FyocxCbONxQS-rOyQ/videos",
          description: ""
        },
        {
          id: 2,
          code: "Unilag",
          name: "University of Lagos",
          address: "University of Lagos, Akoka Rd, Yaba, Lagos",
          email: "communicationunit@unilag.edu.ng",
          phone: "+23412802439",
          motto: "In Deed and In Trust",
          website: "https://unilag.edu.ng/",
          twitter: "https://twitter.com/unilagnigeria?lang=en",
          facebook: "https://www.facebook.com/OfficialUniversityOfLagos/",
          youtube: "https://www.youtube.com/channel/UCmKa7PfQJTutSTdv1ApYjPw",
          description:
            "Founded in 1962, the University of Lagos has, for over 5 decades, provided qualitative and research-oriented education to Nigerians and all those who have entered its domain in search of knowledge. The University has built a legacy of excellence and has been instrumental in the production of top range graduates and academia who have had tremendous impact, directly or indirectly, on growth and development in Nigeria."
        }
      ]);
    });
};
