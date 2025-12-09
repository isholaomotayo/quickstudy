const userProperties = {
  id: { type: "integer" },
  institution_id: { type: "integer" },
  username: { type: "string" },
  first_name: { type: "string" },
  last_name: { type: "string" },
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
  token: { type: "string" },
};
const authProperties = {
  email: {
    type: "string",
    example: "tayo@hdt.ng",
  },
  password: {
    type: "string",
    example: "pass",
  },
};
const codeAuthProperties = {
  code: { type: "string" },
};

const swagger = {
  login: {
    tags: ["Authentication"],
    description: "Login to your user account",
    summary: "Login to your user account",
    body: {
      type: "object",
      required: ["email", "password"],
      properties: authProperties,
    },
    response: {
      // 200: {
      //   description: "authorization token for logged-in user",
      //   type: "object",
      //   properties: userProperties
      // }
    },
  },
  codeLogin: {
    tags: ["Authentication"],
    description: "Auto-Login via Link",
    summary: "Auto Login to your user account via a link containing user code",
    body: {
      type: "object",
      required: ["code"],
      properties: codeAuthProperties,
    },
    response: {
      // 200: {
      //   description: "instant authorization",
      //   type: "object",
      //   properties: userProperties
      // }
    },
  },
  verify: {
    tags: ["Authentication"],
    description:
      "Verify a new user account using the activation code sent tho their account",
    summary:
      "Verify a new user account using the activation code sent tho their account",
    querystring: { code: { type: "string" } },
    response: {
      200: {
        description: "valid user object ",
        type: "object",
        properties: userProperties,
      },
    },
  },
  changePassword: {
    tags: ["Authentication"],
    description:
      "Change a users password by supplying the old password and new one",
    summary:
      "Change a users password by supplying the old password and new one",

    params: { id: { type: "string" } },
    body: {
      type: "object",
      required: ["old_password", "new_password"],
      properties: authProperties,
    },
    response: {
      200: {
        description: "valid user object ",
        type: "object",
        properties: userProperties,
      },
    },
  },
  startPasswordReset: {
    tags: ["Authentication"],
    description: "Initiate a password reset process with a valid user email",
    summary:
      "Initiate a password reset process with a valid user email. An email is sent to the user with a reset code for changing the password",
    body: {
      type: "object",
      required: ["email"],
      properties: { email: { type: "string" } },
    },
    response: {
      200: {
        description: "valid user object ",
        type: "object",
        properties: userProperties,
      },
    },
  },
  resetPassword: {
    tags: ["Authentication"],
    description:
      "completes a password reset process with a valid user pasword and reset code provided",
    summary:
      "completes a password reset process with a valid user pasword and reset code provided",
    body: {
      type: "object",
      required: ["password", "resetCode"],
      properties: {
        password: { type: "string" },
        resetCode: { type: "string" },
      },
    },
    response: {
      200: {
        description: "valid user object ",
        type: "object",
        properties: userProperties,
      },
    },
  },
};
module.exports = swagger;
