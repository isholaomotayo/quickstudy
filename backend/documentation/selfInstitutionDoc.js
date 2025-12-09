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

const userProperties = {
  id: { type: "integer" },
  institution_id: { type: "integer" },
  username: { type: "string" },
  password: { type: "string" },
  first_name: { type: "string" },
  last_name: { type: "string" },
  other_name: { type: "string" },
  email: { type: "string" },
  phone: { type: "string" },
  active: { type: "integer" },
  admin: { type: "integer" },
  reset_code: { type: "string" },
  avatar: { type: "string" },
  personal_info: { type: "string" },
  registration_source: { type: "string" },
  enable_contact_me: { type: "integer" },
  role: { type: "string" },
  student: { type: "object" },
  staff: { type: "object" },
};

const message = {
  email: { type: "string" },
};

const swagger = {
  createInstitution: {
    tags: ["Self Institution"],
    description: "Add a new self institution to the database",
    summary: "Add a new self institution to the database",
    body: {
      type: "object",
      required: ["code", "name", "address", "email", "phone"],
      properties: { ...institutionProperties },
    },
  },
  updateInstitution: {
    tags: ["Self Institution"],
    description: "Update a created institution in the database",
    summary: "Update a created institution in the database",
    body: {
      type: "object",
      properties: { ...institutionProperties, token: { type: "string" } },
    },
  },
  addUser: {
    tags: ["Self Institution"],
    description: "Adds a new user to the database",
    summary: "Adds a new user to the database",
    params: {},
    body: {
      type: "object",
      required: [
        "username",
        "password",
        "first_name",
        "last_name",
        "email",
        "phone",
      ],
      properties: userProperties,
    },
  },
  resendEMail: {
    tags: ["Self Institution"],
    description: "Send a new institution an email",
    summary: "Send a new institution an email",
    body: {
      type: "object",
      required: ["email"],
      properties: { ...message },
    },
  },
};

module.exports = swagger;
