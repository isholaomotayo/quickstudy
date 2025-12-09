const paymentPlanChangeProperties = {
  id: { type: "integer" },
  student_id: { type: "integer" },
  changed_plan: { type: "string" }
};

const swagger = {
  paymentPlanChange: {
    tags: ["Payment-Plan-Change"],
    description: `Change A Student's Payment Plan`,
    summary: `Change A Student's Payment Plan`,
    body: {
      type: "object",

      required: ["student_id", "id", "changed_plan"],
      properties: paymentPlanChangeProperties
    }
  }
};

module.exports = swagger;
