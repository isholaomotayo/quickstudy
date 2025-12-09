exports.up = knex =>
  knex.schema.hasTable('student').then(exists => {
    if (!exists) {
      return knex.schema.createTable('student', table => {
        table
          .bigincrements('id')
          .primary()
          .unsigned();

        table
          .string('reg_no')
          .unique()
          .notNullable();
        table
          .integer('user_id')
          .unsigned()
          .index()
          .references('id')
          .inTable('user');
        table.string('title').nullable();
        table.string('gender').nullable();
        table.timestamp('dob').nullable();

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
          .integer('semester_admitted_id')
          .nullable()
          .unsigned()
          .index()
          .references('id')
          .inTable('semester');

        table
          .integer('session_admitted_id')
          .nullable()
          .unsigned()
          .index()
          .references('id')
          .inTable('session');

        table
          .integer('entry_level_id')
          .nullable()
          .unsigned()
          .index()
          .references('id')
          .inTable('level');

        table.string('ref_fname').nullable();
        table.string('ref_lname').nullable();
        table.string('ref_phone').nullable();
        table.text('ref_address').nullable();

        table
          .boolean('is_deleted')
          .notNullable()
          .defaultTo(0);
        table
          .boolean('status')
          .notNullable()
          .defaultTo(0);
        table
          .boolean('admitted')
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

exports.down = knex => knex.schema.dropTableIfExists('student');
