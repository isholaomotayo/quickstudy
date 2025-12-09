exports.up = knex =>
  knex.schema.hasTable('student').then(exists => {
    if (exists) {
      return knex.schema.table('student', function(table) {
        table
          .enu('marital_status', ['SINGLE', 'MARRIED', 'DIVORCED'])
          .defaultTo('SINGLE');

        table.enu('employment_status', ['EMPLOYED', 'UNEMPLOYED']);

        table.text('id_card');
        table.text('state_origin');
        table.text('lga_origin');
        table.text('state_residence');
        table.text('lga_residence');

        table.text('inst_cert');
        table.timestamp('grad_year');
        table.enu('degree_grade', [
          'First Class',
          'Second Class Upper',
          'Second Class Lower',
          'Third Class',
          'Upper Credit',
          'Lower Credit',
          'Distinction',
          'Merit',
          'Pass'
        ]);
        table.enu('type_degree', [
          'BSc',
          'MSc',
          'HND',
          'B.A',
          'B.ENG',
          'B.PHARM',
          'BSc (ED)',
          'MBBS',
          'B.TECH'
        ]);
        table.text('course_studied');
        table.enu('inst_type', [
          'University',
          'Polytechnic',
          'College of Education'
        ]);
        table.text('inst_name');
      });
    }
    return true;
  });

exports.down = knex =>
  knex.schema.table('student', function(table) {
    table.dropColumn('inst_name');
    table.dropColumn('inst_type');
    table.dropColumn('course_studied');
    table.dropColumn('type_degree');
    table.dropColumn('degree_grade');
    table.dropColumn('grad_year');
    table.dropColumn('inst_cert');
    table.dropColumn('lga_residence');
    table.dropColumn('state_residence');
    table.dropColumn('lga_origin');
    table.dropColumn('state_origin');
    table.dropColumn('id_card');
    table.dropColumn('employment_status');
    table.dropColumn('marital_status');
  });
