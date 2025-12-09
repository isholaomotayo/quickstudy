exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("programme_course")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("programme_course").insert([
        {
          id: 1,
          programme_id: null,
          course_id: 34,
          level_id: 1,
          units: 3,
          created_at: "2020-02-06 22:05:24.11+01",
          updated_at: "2020-02-06 22:05:24.11+01",
          semester_position: null
        },
        {
          id: 2,
          programme_id: null,
          course_id: 33,
          level_id: 1,
          units: 3,
          created_at: "2020-02-06 22:05:24.084+01",
          updated_at: "2020-02-06 22:05:24.084+01",
          semester_position: null
        },
        {
          id: 3,
          programme_id: null,
          course_id: 35,
          level_id: 1,
          units: 3,
          created_at: "2020-02-06 22:05:26.299+01",
          updated_at: "2020-02-06 22:05:26.299+01",
          semester_position: null
        },
        {
          id: 4,
          programme_id: null,
          course_id: 36,
          level_id: 1,
          units: 3,
          created_at: "2020-02-06 22:05:26.493+01",
          updated_at: "2020-02-06 22:05:26.493+01",
          semester_position: null
        },
        {
          id: 5,
          programme_id: null,
          course_id: 37,
          level_id: 1,
          units: 3,
          created_at: "2020-02-06 22:05:26.803+01",
          updated_at: "2020-02-06 22:05:26.803+01",
          semester_position: null
        },
        {
          id: 6,
          programme_id: null,
          course_id: 38,
          level_id: 1,
          units: 3,
          created_at: "2020-02-06 22:05:27.088+01",
          updated_at: "2020-02-06 22:05:27.088+01",
          semester_position: null
        },
        {
          id: 7,
          programme_id: null,
          course_id: 39,
          level_id: 1,
          units: 3,
          created_at: "2020-02-06 22:05:27.384+01",
          updated_at: "2020-02-06 22:05:27.384+01",
          semester_position: null
        },
        {
          id: 8,
          programme_id: 1,
          course_id: 31,
          level_id: 2,
          units: 3,
          created_at: "2020-02-06 22:08:03.456+01",
          updated_at: "2020-02-06 22:08:03.456+01",
          semester_position: null
        },
        {
          id: 9,
          programme_id: 1,
          course_id: 13,
          level_id: 2,
          units: 3,
          created_at: "2020-02-06 22:08:03.511+01",
          updated_at: "2020-02-06 22:08:03.511+01",
          semester_position: null
        },
        {
          id: 10,
          programme_id: 1,
          course_id: 30,
          level_id: 2,
          units: 3,
          created_at: "2020-02-06 22:08:03.546+01",
          updated_at: "2020-02-06 22:08:03.546+01",
          semester_position: null
        },
        {
          id: 11,
          programme_id: 1,
          course_id: 9,
          level_id: 2,
          units: 3,
          created_at: "2020-02-06 22:08:03.603+01",
          updated_at: "2020-02-06 22:08:03.603+01",
          semester_position: null
        },
        {
          id: 12,
          programme_id: 1,
          course_id: 3,
          level_id: 2,
          units: 3,
          created_at: "2020-02-06 22:08:03.674+01",
          updated_at: "2020-02-06 22:08:03.674+01",
          semester_position: null
        },
        {
          id: 13,
          programme_id: 1,
          course_id: 40,
          level_id: 2,
          units: 3,
          created_at: "2020-02-06 22:12:23.425+01",
          updated_at: "2020-02-06 22:12:23.425+01",
          semester_position: null
        },
        {
          id: 14,
          programme_id: 1,
          course_id: 25,
          level_id: 3,
          units: 3,
          created_at: "2020-02-06 22:14:07.081+01",
          updated_at: "2020-02-06 22:14:07.081+01",
          semester_position: null
        },
        {
          id: 15,
          programme_id: 1,
          course_id: 29,
          level_id: 3,
          units: 3,
          created_at: "2020-02-06 22:14:07.144+01",
          updated_at: "2020-02-06 22:14:07.144+01",
          semester_position: null
        },
        {
          id: 16,
          programme_id: 1,
          course_id: 28,
          level_id: 3,
          units: 3,
          created_at: "2020-02-06 22:14:07.227+01",
          updated_at: "2020-02-06 22:14:07.227+01",
          semester_position: null
        },
        {
          id: 17,
          programme_id: 1,
          course_id: 32,
          level_id: 3,
          units: 3,
          created_at: "2020-02-06 22:14:07.262+01",
          updated_at: "2020-02-06 22:14:07.262+01",
          semester_position: null
        },
        {
          id: 18,
          programme_id: 1,
          course_id: 41,
          level_id: 2,
          units: 3,
          created_at: "2020-02-06 22:16:26.432+01",
          updated_at: "2020-02-06 22:16:26.432+01",
          semester_position: null
        },
        {
          id: 19,
          programme_id: 1,
          course_id: 8,
          level_id: 4,
          units: 3,
          created_at: "2020-02-06 22:24:55.273+01",
          updated_at: "2020-02-06 22:24:55.273+01",
          semester_position: null
        },
        {
          id: 20,
          programme_id: 1,
          course_id: 42,
          level_id: 4,
          units: 3,
          created_at: "2020-02-06 22:24:55.345+01",
          updated_at: "2020-02-06 22:24:55.345+01",
          semester_position: null
        },
        {
          id: 21,
          programme_id: 1,
          course_id: 43,
          level_id: 4,
          units: 3,
          created_at: "2020-02-06 22:24:55.381+01",
          updated_at: "2020-02-06 22:24:55.381+01",
          semester_position: null
        },
        {
          id: 22,
          programme_id: 1,
          course_id: 22,
          level_id: 4,
          units: 3,
          created_at: "2020-02-06 22:24:55.416+01",
          updated_at: "2020-02-06 22:24:55.416+01",
          semester_position: null
        },
        {
          id: 23,
          programme_id: 1,
          course_id: 44,
          level_id: 5,
          units: 3,
          created_at: "2020-02-06 23:00:22.196+01",
          updated_at: "2020-02-06 23:00:22.196+01",
          semester_position: null
        },
        {
          id: 24,
          programme_id: 1,
          course_id: 46,
          level_id: 5,
          units: 3,
          created_at: "2020-02-06 23:00:22.25+01",
          updated_at: "2020-02-06 23:00:22.25+01",
          semester_position: null
        },
        {
          id: 25,
          programme_id: 1,
          course_id: 45,
          level_id: 5,
          units: 3,
          created_at: "2020-02-06 23:00:22.339+01",
          updated_at: "2020-02-06 23:00:22.339+01",
          semester_position: null
        },
        {
          id: 26,
          programme_id: 1,
          course_id: 9,
          level_id: 5,
          units: 3,
          created_at: "2020-02-06 23:00:22.413+01",
          updated_at: "2020-02-06 23:00:22.413+01",
          semester_position: null
        },
        {
          id: 27,
          programme_id: 1,
          course_id: 21,
          level_id: 5,
          units: 3,
          created_at: "2020-02-06 23:00:22.513+01",
          updated_at: "2020-02-06 23:00:22.513+01",
          semester_position: null
        },
        {
          id: 28,
          programme_id: 1,
          course_id: 23,
          level_id: 5,
          units: 3,
          created_at: "2020-02-06 23:00:22.561+01",
          updated_at: "2020-02-06 23:00:22.561+01",
          semester_position: null
        },
        {
          id: 29,
          programme_id: 1,
          course_id: 47,
          level_id: 5,
          units: 3,
          created_at: "2020-02-06 23:00:22.583+01",
          updated_at: "2020-02-06 23:00:22.583+01",
          semester_position: null
        },
        {
          id: 30,
          programme_id: 1,
          course_id: 19,
          level_id: 5,
          units: 3,
          created_at: "2020-02-06 23:00:22.614+01",
          updated_at: "2020-02-06 23:00:22.614+01",
          semester_position: null
        },
        {
          id: 31,
          programme_id: 1,
          course_id: 12,
          level_id: 5,
          units: 3,
          created_at: "2020-02-06 23:00:22.645+01",
          updated_at: "2020-02-06 23:00:22.645+01",
          semester_position: null
        },
        {
          id: 32,
          programme_id: 1,
          course_id: 48,
          level_id: 5,
          units: 3,
          created_at: "2020-02-06 23:00:22.669+01",
          updated_at: "2020-02-06 23:00:22.669+01",
          semester_position: null
        },
        {
          id: 33,
          programme_id: 2,
          course_id: 30,
          level_id: 2,
          units: 3,
          created_at: "2020-02-07 00:02:32.918+01",
          updated_at: "2020-02-07 00:02:32.918+01",
          semester_position: null
        },
        {
          id: 34,
          programme_id: 2,
          course_id: 13,
          level_id: 2,
          units: 3,
          created_at: "2020-02-07 00:02:32.881+01",
          updated_at: "2020-02-07 00:02:32.881+01",
          semester_position: null
        },
        {
          id: 35,
          programme_id: 2,
          course_id: 40,
          level_id: 2,
          units: 3,
          created_at: "2020-02-07 00:02:33.01+01",
          updated_at: "2020-02-07 00:02:33.01+01",
          semester_position: null
        },
        {
          id: 36,
          programme_id: 2,
          course_id: 6,
          level_id: 2,
          units: 3,
          created_at: "2020-02-07 00:02:33.058+01",
          updated_at: "2020-02-07 00:02:33.058+01",
          semester_position: null
        },
        {
          id: 37,
          programme_id: 2,
          course_id: 31,
          level_id: 2,
          units: 3,
          created_at: "2020-02-07 00:02:33.087+01",
          updated_at: "2020-02-07 00:02:33.087+01",
          semester_position: null
        },
        {
          id: 38,
          programme_id: 2,
          course_id: 3,
          level_id: 2,
          units: 3,
          created_at: "2020-02-07 00:02:33.134+01",
          updated_at: "2020-02-07 00:02:33.134+01",
          semester_position: null
        },
        {
          id: 39,
          programme_id: 2,
          course_id: 21,
          level_id: 3,
          units: 3,
          created_at: "2020-02-07 00:04:23.605+01",
          updated_at: "2020-02-07 00:04:23.605+01",
          semester_position: null
        },
        {
          id: 40,
          programme_id: 2,
          course_id: 44,
          level_id: 3,
          units: 3,
          created_at: "2020-02-07 00:04:23.672+01",
          updated_at: "2020-02-07 00:04:23.672+01",
          semester_position: null
        },
        {
          id: 41,
          programme_id: 2,
          course_id: 25,
          level_id: 3,
          units: 3,
          created_at: "2020-02-07 00:04:23.843+01",
          updated_at: "2020-02-07 00:04:23.843+01",
          semester_position: null
        },
        {
          id: 42,
          programme_id: 2,
          course_id: 47,
          level_id: 3,
          units: 3,
          created_at: "2020-02-07 00:04:23.889+01",
          updated_at: "2020-02-07 00:04:23.889+01",
          semester_position: null
        },
        {
          id: 43,
          programme_id: 2,
          course_id: 19,
          level_id: 4,
          units: 3,
          created_at: "2020-02-07 00:06:45.914+01",
          updated_at: "2020-02-07 00:06:45.914+01",
          semester_position: null
        },
        {
          id: 44,
          programme_id: 2,
          course_id: 12,
          level_id: 4,
          units: 3,
          created_at: "2020-02-07 00:06:45.945+01",
          updated_at: "2020-02-07 00:06:45.945+01",
          semester_position: null
        },
        {
          id: 45,
          programme_id: 2,
          course_id: 22,
          level_id: 4,
          units: 3,
          created_at: "2020-02-07 00:06:46.121+01",
          updated_at: "2020-02-07 00:06:46.121+01",
          semester_position: null
        },
        {
          id: 46,
          programme_id: 2,
          course_id: 8,
          level_id: 4,
          units: 3,
          created_at: "2020-02-07 00:06:46.176+01",
          updated_at: "2020-02-07 00:06:46.176+01",
          semester_position: null
        },
        {
          id: 47,
          programme_id: 2,
          course_id: 23,
          level_id: 4,
          units: 3,
          created_at: "2020-02-07 00:06:46.215+01",
          updated_at: "2020-02-07 00:06:46.215+01",
          semester_position: null
        },
        {
          id: 48,
          programme_id: 2,
          course_id: 43,
          level_id: 4,
          units: 3,
          created_at: "2020-02-07 00:06:46.26+01",
          updated_at: "2020-02-07 00:06:46.26+01",
          semester_position: null
        },
        {
          id: 49,
          programme_id: 2,
          course_id: 26,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 00:10:33.779+01",
          updated_at: "2020-02-07 00:10:33.779+01",
          semester_position: null
        },
        {
          id: 50,
          programme_id: 2,
          course_id: 18,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 00:10:33.847+01",
          updated_at: "2020-02-07 00:10:33.847+01",
          semester_position: null
        },
        {
          id: 51,
          programme_id: 2,
          course_id: 20,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 00:10:33.887+01",
          updated_at: "2020-02-07 00:10:33.887+01",
          semester_position: null
        },
        {
          id: 52,
          programme_id: 2,
          course_id: 15,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 00:10:33.928+01",
          updated_at: "2020-02-07 00:10:33.928+01",
          semester_position: null
        },
        {
          id: 53,
          programme_id: 2,
          course_id: 10,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 00:10:34.012+01",
          updated_at: "2020-02-07 00:10:34.012+01",
          semester_position: null
        },
        {
          id: 54,
          programme_id: 2,
          course_id: 17,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 00:10:34.074+01",
          updated_at: "2020-02-07 00:10:34.074+01",
          semester_position: null
        },
        {
          id: 55,
          programme_id: 2,
          course_id: 48,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 00:10:34.106+01",
          updated_at: "2020-02-07 00:10:34.106+01",
          semester_position: null
        },
        {
          id: 56,
          programme_id: 2,
          course_id: 50,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 00:19:24.162+01",
          updated_at: "2020-02-07 00:19:24.162+01",
          semester_position: null
        },
        {
          id: 57,
          programme_id: 2,
          course_id: 49,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 00:19:24.243+01",
          updated_at: "2020-02-07 00:19:24.243+01",
          semester_position: null
        },
        {
          id: 58,
          programme_id: 4,
          course_id: 44,
          level_id: 3,
          units: 3,
          created_at: "2020-02-07 00:21:19.023+01",
          updated_at: "2020-02-07 00:21:19.023+01",
          semester_position: null
        },
        {
          id: 59,
          programme_id: 4,
          course_id: 21,
          level_id: 3,
          units: 3,
          created_at: "2020-02-07 00:21:19.071+01",
          updated_at: "2020-02-07 00:21:19.071+01",
          semester_position: null
        },
        {
          id: 60,
          programme_id: 4,
          course_id: 47,
          level_id: 3,
          units: 3,
          created_at: "2020-02-07 00:21:19.115+01",
          updated_at: "2020-02-07 00:21:19.115+01",
          semester_position: null
        },
        {
          id: 61,
          programme_id: 4,
          course_id: 25,
          level_id: 3,
          units: 3,
          created_at: "2020-02-07 00:21:19.155+01",
          updated_at: "2020-02-07 00:21:19.155+01",
          semester_position: null
        },
        {
          id: 62,
          programme_id: 4,
          course_id: 31,
          level_id: 2,
          units: 3,
          created_at: "2020-02-07 00:25:54.483+01",
          updated_at: "2020-02-07 00:25:54.483+01",
          semester_position: null
        },
        {
          id: 63,
          programme_id: 4,
          course_id: 13,
          level_id: 2,
          units: 3,
          created_at: "2020-02-07 00:25:54.558+01",
          updated_at: "2020-02-07 00:25:54.558+01",
          semester_position: null
        },
        {
          id: 64,
          programme_id: 4,
          course_id: 30,
          level_id: 2,
          units: 3,
          created_at: "2020-02-07 00:25:54.607+01",
          updated_at: "2020-02-07 00:25:54.607+01",
          semester_position: null
        },
        {
          id: 65,
          programme_id: 4,
          course_id: 1,
          level_id: 2,
          units: 3,
          created_at: "2020-02-07 00:25:54.643+01",
          updated_at: "2020-02-07 00:25:54.643+01",
          semester_position: null
        },
        {
          id: 66,
          programme_id: 4,
          course_id: 6,
          level_id: 2,
          units: 3,
          created_at: "2020-02-07 00:25:54.684+01",
          updated_at: "2020-02-07 00:25:54.684+01",
          semester_position: null
        },
        {
          id: 67,
          programme_id: 4,
          course_id: 3,
          level_id: 2,
          units: 3,
          created_at: "2020-02-07 00:25:54.714+01",
          updated_at: "2020-02-07 00:25:54.714+01",
          semester_position: null
        },
        {
          id: 68,
          programme_id: 4,
          course_id: 19,
          level_id: 4,
          units: 3,
          created_at: "2020-02-07 00:28:19.187+01",
          updated_at: "2020-02-07 00:28:19.187+01",
          semester_position: null
        },
        {
          id: 69,
          programme_id: 4,
          course_id: 23,
          level_id: 4,
          units: 3,
          created_at: "2020-02-07 00:28:19.281+01",
          updated_at: "2020-02-07 00:28:19.281+01",
          semester_position: null
        },
        {
          id: 70,
          programme_id: 4,
          course_id: 12,
          level_id: 4,
          units: 3,
          created_at: "2020-02-07 00:28:19.325+01",
          updated_at: "2020-02-07 00:28:19.325+01",
          semester_position: null
        },
        {
          id: 71,
          programme_id: 4,
          course_id: 8,
          level_id: 4,
          units: 3,
          created_at: "2020-02-07 00:28:19.357+01",
          updated_at: "2020-02-07 00:28:19.357+01",
          semester_position: null
        },
        {
          id: 72,
          programme_id: 4,
          course_id: 43,
          level_id: 4,
          units: 3,
          created_at: "2020-02-07 00:28:19.399+01",
          updated_at: "2020-02-07 00:28:19.399+01",
          semester_position: null
        },
        {
          id: 73,
          programme_id: 4,
          course_id: 22,
          level_id: 4,
          units: 3,
          created_at: "2020-02-07 00:28:19.44+01",
          updated_at: "2020-02-07 00:28:19.44+01",
          semester_position: null
        },
        {
          id: 74,
          programme_id: 4,
          course_id: 14,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 04:48:04.737+01",
          updated_at: "2020-02-07 04:48:04.737+01",
          semester_position: null
        },
        {
          id: 75,
          programme_id: 4,
          course_id: 48,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 04:48:04.759+01",
          updated_at: "2020-02-07 04:48:04.759+01",
          semester_position: null
        },
        {
          id: 76,
          programme_id: 4,
          course_id: 11,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 04:48:04.78+01",
          updated_at: "2020-02-07 04:48:04.78+01",
          semester_position: null
        },
        {
          id: 77,
          programme_id: 4,
          course_id: 53,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 05:00:51.466+01",
          updated_at: "2020-02-07 05:00:51.466+01",
          semester_position: null
        },
        {
          id: 78,
          programme_id: 4,
          course_id: 51,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 05:00:51.498+01",
          updated_at: "2020-02-07 05:00:51.498+01",
          semester_position: null
        },
        {
          id: 79,
          programme_id: 4,
          course_id: 54,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 05:00:51.527+01",
          updated_at: "2020-02-07 05:00:51.527+01",
          semester_position: null
        },
        {
          id: 80,
          programme_id: 4,
          course_id: 52,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 05:00:51.555+01",
          updated_at: "2020-02-07 05:00:51.555+01",
          semester_position: null
        },
        {
          id: 81,
          programme_id: 3,
          course_id: 30,
          level_id: 2,
          units: 3,
          created_at: "2020-02-07 05:02:19.612+01",
          updated_at: "2020-02-07 05:02:19.612+01",
          semester_position: null
        },
        {
          id: 82,
          programme_id: 3,
          course_id: 13,
          level_id: 2,
          units: 3,
          created_at: "2020-02-07 05:02:19.633+01",
          updated_at: "2020-02-07 05:02:19.633+01",
          semester_position: null
        },
        {
          id: 83,
          programme_id: 3,
          course_id: 6,
          level_id: 2,
          units: 3,
          created_at: "2020-02-07 05:02:19.662+01",
          updated_at: "2020-02-07 05:02:19.662+01",
          semester_position: null
        },
        {
          id: 84,
          programme_id: 3,
          course_id: 31,
          level_id: 2,
          units: 3,
          created_at: "2020-02-07 05:02:19.696+01",
          updated_at: "2020-02-07 05:02:19.696+01",
          semester_position: null
        },
        {
          id: 85,
          programme_id: 3,
          course_id: 3,
          level_id: 2,
          units: 3,
          created_at: "2020-02-07 05:02:19.721+01",
          updated_at: "2020-02-07 05:02:19.721+01",
          semester_position: null
        },
        {
          id: 86,
          programme_id: 3,
          course_id: 1,
          level_id: 2,
          units: 3,
          created_at: "2020-02-07 05:02:19.741+01",
          updated_at: "2020-02-07 05:02:19.741+01",
          semester_position: null
        },
        {
          id: 87,
          programme_id: 3,
          course_id: 21,
          level_id: 3,
          units: 3,
          created_at: "2020-02-07 05:04:13.846+01",
          updated_at: "2020-02-07 05:04:13.846+01",
          semester_position: null
        },
        {
          id: 88,
          programme_id: 3,
          course_id: 47,
          level_id: 3,
          units: 3,
          created_at: "2020-02-07 05:04:13.882+01",
          updated_at: "2020-02-07 05:04:13.882+01",
          semester_position: null
        },
        {
          id: 89,
          programme_id: 3,
          course_id: 44,
          level_id: 3,
          units: 3,
          created_at: "2020-02-07 05:04:13.915+01",
          updated_at: "2020-02-07 05:04:13.915+01",
          semester_position: null
        },
        {
          id: 90,
          programme_id: 3,
          course_id: 55,
          level_id: 3,
          units: 3,
          created_at: "2020-02-07 05:23:33.169+01",
          updated_at: "2020-02-07 05:23:33.169+01",
          semester_position: null
        },
        {
          id: 91,
          programme_id: 3,
          course_id: 8,
          level_id: 4,
          units: 3,
          created_at: "2020-02-07 05:25:39.015+01",
          updated_at: "2020-02-07 05:25:39.015+01",
          semester_position: null
        },
        {
          id: 92,
          programme_id: 3,
          course_id: 19,
          level_id: 4,
          units: 3,
          created_at: "2020-02-07 05:25:39.038+01",
          updated_at: "2020-02-07 05:25:39.038+01",
          semester_position: null
        },
        {
          id: 93,
          programme_id: 3,
          course_id: 12,
          level_id: 4,
          units: 3,
          created_at: "2020-02-07 05:25:39.133+01",
          updated_at: "2020-02-07 05:25:39.133+01",
          semester_position: null
        },
        {
          id: 94,
          programme_id: 3,
          course_id: 23,
          level_id: 4,
          units: 3,
          created_at: "2020-02-07 05:25:39.153+01",
          updated_at: "2020-02-07 05:25:39.153+01",
          semester_position: null
        },
        {
          id: 95,
          programme_id: 3,
          course_id: 22,
          level_id: 4,
          units: 3,
          created_at: "2020-02-07 05:25:39.171+01",
          updated_at: "2020-02-07 05:25:39.171+01",
          semester_position: null
        },
        {
          id: 96,
          programme_id: 3,
          course_id: 43,
          level_id: 4,
          units: 3,
          created_at: "2020-02-07 05:25:39.195+01",
          updated_at: "2020-02-07 05:25:39.195+01",
          semester_position: null
        },
        {
          id: 97,
          programme_id: 3,
          course_id: 5,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 05:28:11.343+01",
          updated_at: "2020-02-07 05:28:11.343+01",
          semester_position: null
        },
        {
          id: 98,
          programme_id: 3,
          course_id: 4,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 05:28:11.364+01",
          updated_at: "2020-02-07 05:28:11.364+01",
          semester_position: null
        },
        {
          id: 99,
          programme_id: 3,
          course_id: 27,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 05:28:11.391+01",
          updated_at: "2020-02-07 05:28:11.391+01",
          semester_position: null
        },
        {
          id: 100,
          programme_id: 3,
          course_id: 24,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 05:28:11.42+01",
          updated_at: "2020-02-07 05:28:11.42+01",
          semester_position: null
        },
        {
          id: 101,
          programme_id: 3,
          course_id: 2,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 05:28:11.452+01",
          updated_at: "2020-02-07 05:28:11.452+01",
          semester_position: null
        },
        {
          id: 102,
          programme_id: 3,
          course_id: 16,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 05:28:11.471+01",
          updated_at: "2020-02-07 05:28:11.471+01",
          semester_position: null
        },
        {
          id: 103,
          programme_id: 3,
          course_id: 7,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 05:28:11.494+01",
          updated_at: "2020-02-07 05:28:11.494+01",
          semester_position: null
        },
        {
          id: 104,
          programme_id: 3,
          course_id: 48,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 05:28:11.516+01",
          updated_at: "2020-02-07 05:28:11.516+01",
          semester_position: null
        },
        {
          id: 105,
          programme_id: 3,
          course_id: 56,
          level_id: 5,
          units: 3,
          created_at: "2020-02-07 05:32:08.317+01",
          updated_at: "2020-02-07 05:32:08.317+01",
          semester_position: null
        }
      ]);
    });
};
