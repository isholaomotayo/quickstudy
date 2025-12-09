exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('course')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('course').insert([
        {
          id: 1,
          department_id: 3,
          programme_id: 2,
          code: 'MKT 873',
          name: 'Strategic Marketing',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 2,
          department_id: 3,
          programme_id: 2,
          code: 'MKT 854',
          name: 'Industrial Marketing',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 3,
          department_id: 2,
          programme_id: 2,
          code: 'BAF 891',
          name: 'Research Methodology',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },

        {
          id: 4,
          department_id: 3,
          programme_id: 2,
          code: 'MKT 822',
          name: 'Pricing Policy ',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 5,
          department_id: 3,
          programme_id: 2,
          code: 'MKT 814',
          name: 'Product Planning and Development',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 6,
          department_id: 4,
          programme_id: 2,
          code: 'MAN 812',
          name: 'Operations Management',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 7,
          department_id: 3,
          programme_id: 2,
          code: 'MKT 876',
          name: 'Marketing Thoughts',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 8,
          department_id: 2,
          programme_id: 2,
          code: 'BAF 833',
          name: 'Managerial Economics',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 9,
          department_id: 1,
          programme_id: 2,
          code: 'ACC 811',
          name: 'Managerial Accounting',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 10,
          department_id: 2,
          programme_id: 2,
          code: 'BAF 866',
          name: 'Management of Financial Institutions',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 11,
          department_id: 4,
          programme_id: 2,
          code: 'MAN 876',
          name: 'Project Management',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 12,
          department_id: 4,
          programme_id: 2,
          code: 'MAN 843',
          name: 'Human Resource Management',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 13,
          department_id: 4,
          programme_id: 2,
          code: 'ACC 813 / MAN 811',
          name: 'Quantitative Methods for Management',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 14,
          department_id: 4,
          programme_id: 2,
          code: 'MAN 878',
          name: 'Leadership and Management',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 15,
          department_id: 2,
          programme_id: 2,
          code: 'BAF 845',
          name: 'Investments and Projects Analysis',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 16,
          department_id: 3,
          programme_id: 2,
          code: 'MKT 862',
          name: 'International Marketing',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 17,
          department_id: 2,
          programme_id: 2,
          code: 'BAF 888',
          name: 'International Business Finance',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 18,
          department_id: 2,
          programme_id: 2,
          code: 'BAF 822',
          name: 'Insurance',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 19,
          department_id: 4,
          programme_id: 2,
          code: 'MAN 803',
          name: 'Introduction to General Management',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 20,
          department_id: 2,
          programme_id: 2,
          code: 'BAF 841',
          name: 'Financial Risks and Management',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 21,
          department_id: 4,
          programme_id: 2,
          code: 'ACC 830 / BAF 831 / MAN 884',
          name: 'Environment of Business',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 22,
          department_id: 4,
          programme_id: 2,
          code: 'ACC 875/ MAN 875',
          name: 'Entrepreneurship',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 23,
          department_id: 4,
          programme_id: 2,
          code: 'MAN 802',
          name: 'Corporate Strategy',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 24,
          department_id: 3,
          programme_id: 2,
          code: 'MKT 852',
          name: 'Consumer Behaviour',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 25,
          department_id: 4,
          programme_id: 2,
          code: 'MAN 852',
          name: 'Business and Company Law',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 26,
          department_id: 2,
          programme_id: 2,
          code: 'BAF 810',
          name: 'Bank Lending and Loan Administration',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 27,
          department_id: 3,
          programme_id: 2,
          code: 'MKT 824',
          name: 'Advertising Management',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 28,
          department_id: 1,
          programme_id: 2,
          code: 'ACC 882',
          name: 'Advanced Auditing and Assurance ',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 29,
          department_id: 1,
          programme_id: 2,
          code: 'ACC 824',
          name: 'Advanced Accounting Theory and Financial Reporting ',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 30,
          department_id: 2,
          programme_id: 2,
          code: 'BAF 811',
          name: 'Corporate Finance',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 31,
          department_id: 1,
          programme_id: 2,
          code: 'PGC 601 / ACC 801 / MAN 855 / MKT 821',
          name: 'ICT Management',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 32,
          department_id: 1,
          programme_id: 2,
          code: 'ACC 852',
          name: 'Advanced Public Sector Accounting',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 33,
          department_id: 2,
          programme_id: 1,
          code: 'CDeL 500',
          name: 'Fundamentals of Banking and Finance',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 34,
          department_id: 1,
          programme_id: 1,
          code: 'CDeL 501',
          name: 'Basic Marketing',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 35,
          department_id: 1,
          programme_id: 1,
          code: 'CDeL 503',
          name: 'Fundamentals of Accounting',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 36,
          department_id: 4,
          programme_id: 1,
          code: 'CDeL 504',
          name: 'Elements of Management',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 37,
          department_id: 2,
          programme_id: 1,
          code: 'CDeL 505',
          name: 'Business Statistics',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 38,
          department_id: 2,
          programme_id: 1,
          code: 'CDeL 506',
          name: 'Principles of Economics',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 39,
          department_id: 1,
          programme_id: 2,
          code: 'CDeL 507',
          name: 'Basic Research Methods',
          level_id: 1,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 40,
          department_id: 3,
          programme_id: 1,
          code: 'MKT 811',
          name: 'Marketing Mangement & Strategy',
          level_id: 2,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 41,
          department_id: 1,
          programme_id: 1,
          code: 'ACC 884',
          name: 'Taxation and Public Finance',
          level_id: 3,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 42,
          department_id: 1,
          programme_id: 1,
          code: 'ACC 821',
          name: 'International Accounting',
          level_id: 4,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 43,
          department_id: 1,
          programme_id: 1,
          code: 'ACC 843 / BAF 892',
          name: 'Graduate Seminar',
          level_id: 4,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 44,
          department_id: 1,
          programme_id: 1,
          code: 'ACC 804 / BAF 832 / MAN 802 ',
          name: 'The On-The-Job Project',
          level_id: 5,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 45,
          department_id: 1,
          programme_id: 1,
          code: 'ACC 822',
          name: 'Accounting for Derivatives and Financial Instruments',
          level_id: 5,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 46,
          department_id: 1,
          programme_id: 1,
          code: 'ACC 834',
          name: 'Professional Ethics and Corporate Governance',
          level_id: 5,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 47,
          department_id: 1,
          programme_id: 1,
          code: 'MAN 874',
          name: 'Organizational Behaviour',
          level_id: 5,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 48,
          department_id: 1,
          programme_id: 1,
          code: 'ACC 890 / MAN 896 / MKT 892 / BAF 890',
          name: 'Project',
          level_id: 5,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 49,
          department_id: 2,
          programme_id: 2,
          code: 'BAF 857',
          name: 'Portfolio Theory and Capital Market Analysis',
          level_id: 5,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 50,
          department_id: 2,
          programme_id: 2,
          code: 'BAF 879',
          name: 'Case Problem in Financial Management',
          level_id: 5,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 51,
          department_id: 4,
          programme_id: 4,
          code: 'MAN 874',
          name: 'Interpersonal Skill Development',
          level_id: 5,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 52,
          department_id: 4,
          programme_id: 4,
          code: 'MAN 844',
          name: 'Industrial Relations',
          level_id: 5,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 53,
          department_id: 4,
          programme_id: 4,
          code: 'MAN 884',
          name: 'Global Economic Environment',
          level_id: 5,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 54,
          department_id: 4,
          programme_id: 4,
          code: 'MAN 846',
          name: 'Appraisal and Compensation Management',
          level_id: 5,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 55,
          department_id: 3,
          programme_id: 3,
          code: 'BAF 831',
          name: 'Business Law',
          level_id: 3,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        },
        {
          id: 56,
          department_id: 3,
          programme_id: 3,
          code: 'MKT 874',
          name: 'Marketing Research',
          level_id: 5,
          units: 3,
          semester_position: 1,
          description:
            'Key: ACC-Accounting; BAF-Banking and Finance; MKT-Marketing, MAN-Management'
        }
      ]);
    });
};
