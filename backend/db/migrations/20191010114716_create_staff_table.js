exports.up = knex =>
  knex.schema.hasTable('staff').then(exists => {
    if (!exists) {
      return knex.schema.createTable('staff', table => {
        table
          .bigincrements('id')
          .primary()
          .unsigned();

        table
          .string('staff_no')
          .unique()
          .nullable();
        table
          .integer('user_id')
          .unsigned()
          .index()
          .references('id')
          .inTable('user');
        table
          .integer('dept_id')
          .nullable()
          .unsigned()
          .index();
        //.references('id').inTable('department');

        table.string('title').nullable();
        table.string('gender').nullable();
        table.date('dob').nullable();

        table
          .integer('nationality_id')
          .nullable()
          .unsigned()
          .index()
          .references('id')
          .inTable('country');
        table
          .integer('state_origin_id')
          .nullable()
          .unsigned()
          .index()
          .references('id')
          .inTable('state');
        table
          .integer('lga_id')
          .nullable()
          .unsigned()
          .index()
          .references('id')
          .inTable('lga');

        table
          .boolean('is_deleted')
          .notNullable()
          .defaultTo(0);
        table.timestamps(true, true);
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
      });
    }
    return true;
  });

exports.down = knex => knex.schema.dropTableIfExists('staff');
