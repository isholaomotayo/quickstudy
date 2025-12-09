exports.up = knex =>
knex.schema.hasTable('staff').then(exists => {
    if (exists) {
        return knex.schema.table('staff', function(table) {
            table.integer('department_id').references('department.id').nullable()
        })
    }
    return true
})

exports.down = knex =>
knex.schema.table('staff', function(table) {
    table.dropColumn('department_id')
})
