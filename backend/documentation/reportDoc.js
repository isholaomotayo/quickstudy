const studentProperties = {
  id: { type: "integer" },
  reg_no: { type: "string" },
  user_id: { type: "integer" },
  programme_id: { type: "integer" },
  semester_admitted_id: { type: "integer" },
  entry_level_id: { type: "integer" },
  address: { type: "string" },
  gender: { type: "string" },
  ref_fname: { type: "string" },
  ref_lname: { type: "string" },
  ref_phone: { type: "string" },
  ref_address: { type: "string" },

  admitted: { type: "boolean" },
};

const swagger = {
  getAllReports: {
    tags: ["Report"],
    description: "Get all data for the report dashboard",
    summary: "Get all data for the report dashboard",
  },

  getReportById: {
    tags: ["Report"],
    params: {
      institution_id: { type: "integer" },
    },
    description: "Get all data for the report dashboard",
    summary: "Get all data for the report dashboard",
  },

  getAnalytics: {
    tags: ["Report"],
    params: {
      institution_id: { type: "integer" },
    },
    querystring: {
      startDate: { type: "string", format: "date" },
      endDate: { type: "string", format: "date" },
    },
    description: "Get processed analytics data for institution dashboard",
    summary: "Get analytics data with calculations done server-side",
    response: {
      200: {
        type: "object",
        properties: {
          summary: {
            type: "object",
            properties: {
              totalApplications: { type: "number" },
              ongoingApplications: { type: "number" },
              completedApplications: { type: "number" },
              admittedStudents: { type: "number" },
              acceptanceFeePaid: { type: "number" },
              conversionRate: { type: "number" },
              completionRate: { type: "number" },
              acceptanceRate: { type: "number" },
            },
          },
          monthlyTrends: {
            type: "array",
            items: {
              type: "object",
              properties: {
                month: { type: "string" },
                ongoing: { type: "number" },
                completed: { type: "number" },
                admitted: { type: "number" },
              },
            },
          },
          distributions: {
            type: "object",
            properties: {
              programmes: {
                type: "object",
                additionalProperties: { type: "number" },
              },
              departments: {
                type: "object",
                additionalProperties: { type: "number" },
              },
              faculties: {
                type: "object",
                additionalProperties: { type: "number" },
              },
              status: {
                type: "object",
                properties: {
                  ongoing: { type: "number" },
                  completed: { type: "number" },
                  admitted: { type: "number" },
                  acceptancePaid: { type: "number" },
                },
              },
            },
          },
          demographics: {
            type: "object",
            properties: {
              gender: {
                type: "object",
                additionalProperties: { type: "number" },
              },
              ageGroups: {
                type: "object",
                additionalProperties: { type: "number" },
              },
              employment: {
                type: "object",
                additionalProperties: { type: "number" },
              },
              maritalStatus: {
                type: "object",
                additionalProperties: { type: "number" },
              },
              previousEducation: {
                type: "object",
                additionalProperties: { type: "number" },
              },
            },
          },
          financial: {
            type: "object",
            properties: {
              totalRevenue: { type: "number" },
              paymentCount: { type: "number" },
            },
          },
        },
      },
    },
  },

  getWeeklyReports: {
    tags: ["Report"],
    description: "Get weekly report data",
    summary: "Get weekly report data",
  },
};

module.exports = swagger;
