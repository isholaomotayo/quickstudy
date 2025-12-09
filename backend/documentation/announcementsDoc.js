const AnnouncementProperties = {
  id: { type: "integer" },
  name: { type: "string" },
  body: { type: "string" },
  created_at: { type: "string" },
  updated_at: { type: "string" },
  user_id: { type: "integer" },
  institution_id: { type: "integer" },
  title: { type: "string" },
  read: { type: "boolean" },
  description: { type: "string" },
  created_at: { type: "string" },
  updated_at: { type: "string" },
};

const userProperties = {
  user: {
    type: "object",
    properties: {
      id: { type: "integer" },
      institution_id: { type: "integer" },
      first_name: { type: "string" },
      last_name: { type: "string" },
      avatar: { type: "string" },
      role: { type: "string" },
    },
  },
};

module.exports = {
  createAnnouncement: {
    tags: ["Announcements"],
    body: {
      type: "object",
      properties: {
        title: { type: "string" },
        body: { type: "string" },
        user_id: { type: "integer" },
        institution_id: { type: "integer" },
      },
      required: ["body", "user_id", "title", "institution_id"],
    },
    response: {
      200: {
        type: "object",
        description: "An Announcement Topic (Subject to be discussed)",
        properties: {
          ...AnnouncementProperties,
          ...userProperties,
        },
      },
    },
  },
  getAllAnnouncements: {
    tags: ["Announcements"],
    response: {
      200: {
        type: "array",
        description: "An Announcement Topic (Subject to be discussed)",
        items: {
          type: "object",
          properties: {
            ...AnnouncementProperties,
            ...userProperties,
          },
        },
      },
    },
  },
  getAnnouncement: {
    tags: ["Announcements"],
    params: {
      institution_id: { type: "integer" },
    },
    response: {
      200: {
        type: "array",
        description: "An Announcement Topic (Subject to be discussed)",
        items: {
          type: "object",
          properties: {
            ...AnnouncementProperties,
            ...userProperties,
          },
        },
      },
      400: {
        type: "object",
        description:
          "error object with a descriptive message stating why the request failed",
        properties: {
          statusCode: { type: "integer" },
          error: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
  updateAnnouncement: {
    tags: ["Announcements"],
    params: {
      id: { type: "string" },
    },

    body: {
      type: "object",
      properties: {
        title: { type: "string" },
        body: { type: "string" },
      },
      required: ["title", "body"],
    },
    response: {
      200: {
        type: "object",
        description: "An Announcement Topic (Subject to be discussed)",
        properties: {
          ...AnnouncementProperties,
          ...userProperties,
        },
      },
      400: {
        type: "object",
        description:
          "error object with a descriptive message stating why the request failed",
        properties: {
          statusCode: { type: "integer" },
          error: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
  deleteAnnouncement: {
    tags: ["Announcements"],
    params: {
      id: { type: "integer" },
    },

    response: {
      200: {
        type: "object",
        description: "An Announcement Topic (Subject to be discussed)",
        properties: AnnouncementProperties,
      },
      400: {
        type: "object",
        description:
          "error object with a descriptive message stating why the request failed",
        properties: {
          statusCode: { type: "integer" },
          error: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
  searchSchoolAnnouncement: {
    tags: ["Announcements"],
    description: "Search for an announcement by title",
    summary: "Search for an announcement by title",
    query: { searchValue: { type: "string" } },
  },
};
