exports.up = knex =>
  knex.schema.hasTable('user').then(exists => {
    if (!exists) {
      return knex.schema.createTable('user', table => {
        table
          .bigincrements('id')
          .primary()
          .unsigned();

        table
          .string('username')
          .unique()
          .notNullable();
        table.string('password').notNullable();

        table.string('first_name').notNullable();
        table.string('last_name').notNullable();
        table.string('other_name');
        table
          .string('email')
          .unique()
          .notNullable();

        table
          .string('phone')
          .unique()
          .nullable();

        table.string('code').unique();
        table
          .enu('role', [
            'AFFILIATE',
            'APPLICANT',
            'DECLINED APPLICANT',
            'DEFERRED',
            'STUDENT',
            'STAFF',
            'LECTURER',
            'HOD',
            'ADMIN',
            'SUPERADMIN'
          ])
          .defaultTo('APPLICANT');

        table.text('application_declined_reason');

        table
          .boolean('active')
          .notNullable()
          .defaultTo(0);
        table
          .integer('admin')
          .notNullable()
          .defaultTo(0);
        table.string('reset_code').nullable();
        table.string('avatar').nullable();

        table.text('personal_info', 'longtext').nullable();

        table
          .string('registration_source')
          .nullable()
          .defaultTo('web');
        table
          .boolean('enable_contact_me')
          .notNullable()
          .defaultTo(0);

        table.timestamps(true, true);
      });
    }
    return true;
  });

exports.down = knex => knex.schema.dropTableIfExists('user');
