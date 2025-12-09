const AnnouncementProperties = {
  id: { type: "integer" },
  name: { type: "string" },
  body: { type: "string" },
  created_at: { type: "string" },
  updated_at: { type: "string" },
  user_id: { type: "integer" },
  course_id: { type: "integer" },
  title: { type: "string" },
  description: { type: "string" },
  created_at: { type: "string" },
  updated_at: { type: "string" }
};

const userProperties = {
  user: {
    type: "object",
    properties: {
      id: { type: "integer" },
      institution_id: { type: "integer" },
      username: { type: "string" },
      password: { type: "string" },
      first_name: { type: "string" },
      last_name: { type: "string" },
      active: { type: "integer" },
      avatar: { type: "string" },
      role: { type: "string" }
    }
  }
};

module.exports = {
  createCourseAnnouncement: {
    tags: ["Course Announcements"],
    body: {
      type: "object",
      properties: {
        title: { type: "string" },
        body: { type: "string" },
        user_id: { type: "integer" },
        course_id: { type: "integer" }
      },
      required: ["body", "user_id", "title", "course_id"]
    },
    response: {
      200: {
        type: "object",
        description: "An Announcement Topic (Subject to be discussed)",
        properties: {
          ...AnnouncementProperties,
          ...userProperties
        }
      }
    }
  },
  getAllCourseAnnouncements: {
    tags: ["Course Announcements"],
    response: {
      200: {
        type: "array",
        description: "An Announcement Topic (Subject to be discussed)",
        items: {
          type: "object",
          properties: {
            ...AnnouncementProperties,
            ...userProperties
          }
        }
      }
    }
  },
  getCourseAnnouncement: {
    tags: ["Course Announcements"],
    params: {
      id: { type: "integer" }
    }
    // response: {
    //   200: {
    //     type: "array",
    //     description: "An Announcement Topic (Subject to be discussed)",
    //     items: {
    //       type: "object",
    //       properties: {
    //         ...AnnouncementProperties,
    //         ...userProperties
    //       }
    //     }
    //   },
    //   400: {
    //     type: "object",
    //     description:
    //       "error object with a descriptive message stating why the request failed",
    //     properties: {
    //       statusCode: { type: "integer" },
    //       error: { type: "string" },
    //       message: { type: "string" }
    //     }
    //   }
    // }
  },
  updateCourseAnnouncement: {
    tags: ["Course Announcements"],
    params: {
      id: { type: "string" }
    },

    body: {
      type: "object",
      properties: {
        title: { type: "string" },
        body: { type: "string" }
      },
      required: ["title", "body"]
    },
    response: {
      200: {
        type: "object",
        description: "An Announcement Topic (Subject to be discussed)",
        properties: {
          ...AnnouncementProperties,
          ...userProperties
        }
      },
      400: {
        type: "object",
        description:
          "error object with a descriptive message stating why the request failed",
        properties: {
          statusCode: { type: "integer" },
          error: { type: "string" },
          message: { type: "string" }
        }
      }
    }
  },
  deleteCourseAnnouncement: {
    tags: ["Course Announcements"],
    params: {
      id: { type: "integer" }
    },

    response: {
      200: {
        type: "object",
        description: "An Announcement Topic (Subject to be discussed)",
        properties: AnnouncementProperties
      },
      400: {
        type: "object",
        description:
          "error object with a descriptive message stating why the request failed",
        properties: {
          statusCode: { type: "integer" },
          error: { type: "string" },
          message: { type: "string" }
        }
      }
    }
  }
};
