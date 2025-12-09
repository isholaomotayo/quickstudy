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
  staff: { type: "object" }
};

const message = {
  subject: { type: "string" },
  message: { type: "string" }
};

const swagger = {
  supportDoc: {
    tags: ["Send Support"],
    description: "Forward message to support mail",
    summary: "Forward message to support mail",
    body: {
      type: "object",
      required: ["subject", "message"],
      properties: { ...userProperties, ...message }
    }
  }
};

module.exports = swagger;
