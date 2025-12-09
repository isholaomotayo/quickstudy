const paymentProperties = {
  id: { type: "integer", readOnly: true },
  student_id: { type: "integer", readOnly: true },
  amount: { type: "number" }, // { type: "number", multipleOf: 0.01 }
  cart: {
    // {"3":{"name": "MBA School Fees", "qty":4, "unit_price":22900, "fee_plan": "monthly", "fee_from": "2020-02-08"}, ...}
    type: "object",
    additionalProperties: {
      type: "object",
      properties: {
        name: { type: "string", readOnly: true },
        unit_price: { type: "number", readOnly: true },
        quantity: { type: "integer" },
        fee_plan: { type: "string", nullable: true },
        fee_from: { type: "string", readOnly: true },
        expiry: { type: "string", readOnly: true },
        semester_id: { type: "integer", nullable: true },
        session_id: { type: "integer", nullable: true },
      },
    },
  },
  institution_id: { type: "integer", readOnly: true },
  department_id: { type: "integer", readOnly: true },
  processor: { type: "string", nullable: true },
  reference: { type: "string", nullable: true },
  ip: { type: "string", readOnly: true },
  status: { type: "integer", nullable: true },
  created_at: { type: "string", format: "date-time", readOnly: true },
  updated_at: { type: "string", format: "date-time", readOnly: true },
  paid_at: { type: "string", format: "date-time", readOnly: true },
  channel: { type: "string", readOnly: true },
  processor_currency: { type: "string", readOnly: true },
  processor_status: { type: "string", readOnly: true },
};

const swagger = {
  list: {
    description: "Get all payments in the database",
    summary: "Get all payments in the database",
    tags: ["payment2"],
    params: {},
    response: {
      // 200: {
      //   description: "Array containing all payments",
      //   type: "array",
      //   items: { type: "object", properties: paymentProperties }
      // }
    },
  },
  listPayables: {
    description: "Generate all outstanding payable fees for a student",
    summary:
      "Generate all outstanding payable fees. A mix of Fixed Fees objects and Flexible due objects",
    tags: ["payment2"],
    params: {},
    response: {
      // 200: {
      //   description: "Array containing all payables",
      //   type: "array",
      //   items: { type: "object", properties: xx }
      // }
    },
  },
  get: {
    tags: ["payment2"],
    description: "Get a payment from the database",
    summary: "Get a payment from the database",

    params: { id: { type: "integer" } },
  },
  add: {
    tags: ["payment2"],
    description: "Add a payment to the database",
    summary: "Add a payment to the database",

    params: {},
    body: {
      type: "object",
      required: ["amount"],
      properties: paymentProperties,
    },
    response: {
      200: {
        description: "A payment",
        type: "object",
        properties: paymentProperties,
      },
    },
  },
  // update: {
  //   tags: ["payment2"],
  //   description: "Update a payment in the database",
  //   summary: "Update a payment in the database",

  //   params: { id: { type: "string" } },
  //   body: {
  //     type: "object",
  //     required: [],
  //     properties: paymentProperties
  //   }
  // },
  // delete: {
  //   tags: ["payment2"],
  //   description: "Delete a payment from the database",
  //   summary: "Delete a payment from the database",

  //   params: { id: { type: "string" } },
  //   response: {
  //     200: {
  //       description: "",
  //       type: "object",
  //     }
  //   }
  // }
};

module.exports = swagger;
