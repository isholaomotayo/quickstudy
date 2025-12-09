exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("fee")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("fee").insert([
        {
          name: "Application Fees",
          description: "Non refundable Application Fees",
          amount: "25000",
          optional: "0", //paid in full
          compulsory: "1",
          frequency: "1",
          institution_id: "1"
        },
        {
          name: "Acceptance Fees",
          description: "Acceptance Fees",
          amount: "10000",
          optional: "0", //paid in full
          compulsory: "1",
          frequency: "1",
          institution_id: "1"
        },
        {
          name: "MBA School Fees",
          amount: "412200",
          description: "MBA School Fees",
          optional: "1", //installmental payment allowed
          compulsory: "1",
          frequency: "1",
          institution_id: "1",
          level_id: "2",
          monthly: "22900.00",
          monthly_parts: 18,
          semesterly: "103050.00",
          semesterly_parts: 4,
          sessionly: "206100.00",
          sessionly_parts: 2
        },
        {
          name: "Exam Fees",
          description: "Exam Fees are paid every semester.",
          amount: "10000",
          optional: "0",
          compulsory: "1",
          frequency: "1",
          institution_id: "1"
        },
        {
          name: "ICT Administration Fees",
          description: "This fee is paid once in the first semester.",
          amount: "5000",
          optional: "0",
          compulsory: "1",
          frequency: "1",
          institution_id: "1"
        },
        {
          name: "Identity Card Fees",
          description:
            "Identity Card Fee is compulsory. This fee is paid once in the first semester.",
          amount: "2000",
          optional: "0",
          compulsory: "0",
          frequency: "1",
          institution_id: "1"
        },
        {
          name: "Result Verification Fees",
          description: "Result Verification Fees",
          amount: "10000",
          optional: "1",
          compulsory: "0",
          frequency: "1",
          institution_id: "1",
          level_id: "4"
        },
        {
          name: "Gown Fees",
          description: "Gown Fees",
          amount: "5000",
          optional: "1",
          compulsory: "0",
          frequency: "1",
          institution_id: "1",
          level_id: "4"
        },
        {
          name: "Statement of Result Fees",
          description: "Statement of Result Fees",
          amount: "5000",
          optional: "1",
          compulsory: "0",
          frequency: "1",
          institution_id: "1",
          level_id: "4"
        },
        {
          name: "Certificate Fees",
          description: "Certificate Fees",
          amount: "1000",
          optional: "1",
          compulsory: "0",
          frequency: "1",
          institution_id: "1",
          level_id: "4"
        },
        {
          name: "Project Fees",
          description: "Project Fees",
          amount: "40000",
          optional: "1",
          compulsory: "0",
          frequency: "1",
          institution_id: "1",
          level_id: "4"
        },
        {
          name: "Pre-MBA School Fees",
          amount: "103500",
          description: "Pre-MBA School Fees",
          optional: "1", //installmental payment allowed
          compulsory: "1",
          frequency: "1",
          institution_id: "1",
          level_id: "1",
          monthly: "20700.00"
        }
      ]);
    });
};
