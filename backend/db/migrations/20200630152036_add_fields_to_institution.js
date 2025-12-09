exports.up = knex =>
  knex.schema.hasTable("institution").then(exists => {
    if (exists) {
      return knex.schema.table("institution", function(table) {
        table.string("logo");
        table.string("host_name");
        table.string("support_mail");
        table.string("admission_mail");
        table.string("school_calendar");
        table.string("director_signature");
      });
    }
    return true;
  });

exports.down = knex =>
  knex.schema.table("institution", function(table) {
    table.dropColumn("logo");
    table.dropColumn("host_name");
    table.dropColumn("support_mail");
    table.dropColumn("admission_mail");
    table.dropColumn("school_calendar");
    table.dropColumn("director_signature");
  });
