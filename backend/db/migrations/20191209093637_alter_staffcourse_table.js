exports.up = knex =>
knex.schema.hasTable('staff_course').then(exists => {
if (exists) {
    return knex.schema.alterTable('staff_course', function(table) {
    table.unique(['staff_id','course_id']);
    });
}
return true;
});

exports.down = knex =>
knex.schema.alterTable('staff_course', function(table) {
table
    .dropUnique(['staff_id','course_id']);
});
