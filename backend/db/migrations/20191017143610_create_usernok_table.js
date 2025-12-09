exports.up = knex =>
knex.schema.hasTable('user_nok').then(exists => {
    if (exists) {
    knex.schema.table('user_nok', function (table) {
        
        table.integer('user_id').unsigned().index().references('id').inTable('user');
        table.integer('nok_id').unsigned().index().references('id').inTable('next_of_kin');
    })
    }
    return true;
});


exports.down = knex => knex.schema.dropTableIfExists('user_nok');
