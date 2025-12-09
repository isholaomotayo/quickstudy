const institutionProperties = {
  id: { type: "integer", readOnly: true },
  code: { type: "string" },
  name: { type: "string" },
  address: { type: "string" },
  email: { type: "string" },
  phone: { type: "string" },
  motto: { type: "string" },
  website: { type: "string" },
  twitter: { type: "string" },
  facebook: { type: "string" },
  youtube: { type: "string" },
  description: { type: "string" },
  logo: { type: "string" },
  school_calendar: { type: "string" },
  calendar_data: {
    type: ["object", "null"],
    nullable: true,
    properties: {
      academic_year: { type: "string" },
      semesters: { type: "array", items: { type: "object" } },
      events: { type: "array", items: { type: "object" } },
      terms: { type: "array", items: { type: "object" } },
      holidays: { type: "array", items: { type: "object" } },
      exam_periods: { type: "array", items: { type: "object" } },
      registration_periods: { type: "array", items: { type: "object" } },
      raw_text: { type: "string" },
      parsed_at: { type: "string", format: "date-time" },
    },
  },
  director_signature: { type: "string" },
  id_card: {
    type: "object",
    properties: {
      front: { type: "string" },
      back: { type: "string" },
    },
  },
  paywall_on: { type: "boolean", default: false },
  created_at: { type: "string", format: "date-time", readOnly: true },
  updated_at: { type: "string", format: "date-time", readOnly: true },
};

const paramInstitutionProperties = {
  id: { type: "integer", readOnly: true },
  code: { type: "string" },
  name: { type: "string" },
  address: { type: "string" },
  email: { type: "string" },
  phone: { type: "string" },
  motto: { type: "string" },
  website: { type: "string" },
  twitter: { type: "string" },
  facebook: { type: "string" },
  youtube: { type: "string" },
  description: { type: "string" },
};

const calendarDataProperties = {
  academic_year: { type: "string" },
  semesters: {
    type: "array",
    items: {
      type: "object",
      properties: {
        name: { type: "string" },
        events: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              start_date: { type: "string", format: "date" },
              end_date: { type: "string", format: "date" },
              semester: { type: "number" },
              holiday: { type: "boolean" },
            },
          },
        },
      },
    },
  },
};

const swagger = {
  list: {
    description: "Get all institutions in the database",
    summary: "Get all institutions in the database",
    tags: ["institution"],
    params: {},

    response: {
      200: {
        description: "Array containing all institutions",
        type: "array",
        items: { type: "object", properties: institutionProperties },
      },
    },
  },
  get: {
    tags: ["institution"],
    description: "Get an institution from the database",
    summary: "Get an institution from the database",

    params: { id: { type: "string" } },
    response: {
      // 200: {
      //   description: 'An institution',
      //   type: 'object',
      //   properties: institutionProperties
      // }
    },
  },
  add: {
    tags: ["institution"],
    description: "Add an institution to the database",
    summary: "Add an institution to the database",

    params: {},
    body: {
      type: "object",
      required: ["code", "name", "address", "email", "phone"],
      properties: institutionProperties,
    },
    response: {
      200: {
        description: "An institution",
        type: "object",
        properties: institutionProperties,
      },
    },
  },
  update: {
    tags: ["institution"],
    description: "Update an institution in the database",
    summary: "Update an institution in the database",

    params: { id: { type: "string" } },
    body: {
      type: "object",
      // required: ["code", "name", "address", "email", "phone"],
      properties: institutionProperties,
    },
    response: {
      200: {
        description: "An institution",
        type: "object",
        properties: institutionProperties,
      },
    },
  },
  delete: {
    tags: ["institution"],
    description: "Delete an institution from the database",
    summary: "Delete an institution from the database",

    params: { id: { type: "string" } },
    response: {
      200: {
        description: "",
        type: "object",
      },
    },
  },

  getInstitutionByParams: {
    tags: ["institution"],
    description: "Get an institution from the database",
    summary: "Get an institution from the database",

    // params: { id: { type: 'string' } },
    body: {
      type: "object",
      properties: paramInstitutionProperties,
    },
    response: {
      // 200: {
      //   description: 'An institution',
      //   type: 'object',
      //   properties: institutionProperties
      // }
    },
  },

  // Calendar-related documentation
  saveCalendarData: {
    tags: ["institution"],
    description: "Save calendar data for an institution",
    summary: "Save calendar data for an institution",

    body: {
      type: "object",
      required: ["institutionId", "calendarData"],
      properties: {
        institutionId: { type: "number" },
        calendarData: {
          type: "object",
          properties: calendarDataProperties,
        },
      },
    },
    response: {
      200: {
        description: "Success response",
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: { type: "object", properties: institutionProperties },
        },
      },
      400: {
        description: "Bad request",
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
        },
      },
      404: {
        description: "Institution not found",
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
        },
      },
    },
  },

  getCalendarData: {
    tags: ["institution"],
    description: "Get calendar data for an institution",
    summary: "Get calendar data for an institution",

    params: { institutionId: { type: "string" } },
    response: {
      200: {
        description: "Success response",
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {
            type: ["object", "null"],
            nullable: true,
            properties: calendarDataProperties,
          },
        },
      },
      404: {
        description: "Institution not found",
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
        },
      },
    },
  },

  getAllWithCalendarData: {
    tags: ["institution"],
    description: "Get all institutions with calendar data",
    summary: "Get all institutions with calendar data",

    response: {
      200: {
        description: "Success response",
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {
            type: "array",
            items: { type: "object", properties: institutionProperties },
          },
        },
      },
    },
  },
};

module.exports = swagger;
