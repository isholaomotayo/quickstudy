exports.up = knex =>
  knex.schema.hasTable('fee').then(exists => {
    if (!exists) {
      return knex.schema.createTable('fee', table => {
        table.bigincrements();
        table.string('name').notNullable();
        table.string('description').nullable();
        table.decimal('amount', 20, 2);
        table.integer('optional');
        table.integer('frequency');
        table.integer('compulsory');
        table
          .integer('institution_id')
          .unsigned()
          .index()
          .references('id')
          .inTable('institution');
        table
          .integer('session_id')
          .unsigned()
          .index()
          .references('id')
          .inTable('session');
        table
          .integer('faculty_id')
          .unsigned()
          .index()
          .references('id')
          .inTable('faculty');
        table
          .integer('department_id')
          .unsigned()
          .index()
          .references('id')
          .inTable('department');
        table
          .integer('programme_id')
          .unsigned()
          .index()
          .references('id')
          .inTable('programme');
        table
          .integer('level_id')
          .unsigned()
          .index()
          .references('id')
          .inTable('level');
        table.timestamps(true);
        table
          .integer('created_by')
          .unsigned()
          .index()
          .references('id')
          .inTable('user');
        table
          .integer('updated_by')
          .unsigned()
          .index()
          .references('id')
          .inTable('user');

        table
          .boolean('active')
          .notNullable()
          .defaultTo(1);
      });
    }
    return true;
  });

exports.down = knex => knex.schema.dropTableIfExists('fee');
