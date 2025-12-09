const forumCategoryProperties = {
  id: { type: "integer" },
  name: { type: "string" },
  created_at: { type: "string" },
  updated_at: { type: "string" },
};

const courseProperties = {
  id: { type: "integer" },
  name: { type: "string" },
  created_at: { type: "string" },
  updated_at: { type: "string" },
};

const forumTopicProperties = {
  id: { type: "integer" },
  name: { type: "string" },
  body: { type: "string" },
  created_at: { type: "string" },
  updated_at: { type: "string" },
  user_id: { type: "integer" },
  course: { type: "object", properties: courseProperties },
  title: { type: "string" },
  description: { type: "string" },
  created_at: { type: "string" },
  updated_at: { type: "string" },
};

const forumThreadProperties = {
  id: { type: "integer" },
  body: { type: "string" },
  created_at: { type: "string" },
  updated_at: { type: "string" },
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
      role: { type: "string" },
    },
  },
};

module.exports = {
  createSchoolForumCategory: {
    tags: ["School forum"],
    body: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
    },
    response: {
      200: {
        type: "object",
        description: "A forum category name and ID",
        properties: forumCategoryProperties,
      },
    },
  },
  getAllForumCategories: {
    tags: ["School forum"],

    response: {
      200: {
        type: "array",

        description: "A forum category name and ID",
        items: {
          type: "object",
          properties: {
            ...forumCategoryProperties,
            forumTopics: {
              type: "array",
              items: { type: "object", properties: forumTopicProperties },
            },
          },
        },
      },
    },
  },
  getForumCategories: {
    tags: ["School forum"],
    params: { id: { type: "string" } },
    response: {
      200: {
        type: "object",
        description: "A forum category name and ID",
        properties: forumCategoryProperties,
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
  updateForumCategories: {
    tags: ["School forum"],
    params: { id: { type: "string" } },
    body: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
    },
    response: {
      200: {
        type: "object",
        description: "A forum category name and ID",
        properties: forumCategoryProperties,
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
  deleteForumCategories: {
    tags: ["School forum"],
    params: {
      id: { type: "string" },
    },

    response: {
      204: {
        type: "string",
        description: "A forum Category (Subject to be discussed)",
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
  //School Forum Thread documentation

  createForumThread: {
    tags: ["School forum"],
    body: {
      type: "object",
      properties: {
        body: { type: "string" },
        user_id: { type: "integer" },
        school_forum_topic_id: { type: "integer" },
      },
      required: ["body", "user_id", "school_forum_topic_id"],
    },
    response: {
      200: {
        type: "object",
        description: "A forum Thread (Comment)",

        properties: { ...forumThreadProperties, ...userProperties },
      },
    },
  },
  getAllForumThreads: {
    tags: ["School forum"],
    params: { school_forum_topic_id: { type: "integer" } },
    response: {
      200: {
        type: "array",
        description: "A collection of forum Threads (Comments)",
        items: {
          type: "object",
          properties: { ...forumThreadProperties, ...userProperties },
        },
      },
    },
  },
  getForumThread: {
    tags: ["School forum"],
    params: {
      school_forum_topic_id: { type: "integer" },
      id: { type: "string" },
    },
    response: {
      200: {
        type: "object",
        description: "A forum Thread (Comment)",
        properties: { ...forumThreadProperties, ...userProperties },
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
  updateForumThread: {
    tags: ["School forum"],
    params: {
      id: { type: "integer" },
    },

    body: {
      type: "object",
      properties: { body: { type: "string" } },
      required: ["body"],
    },
    response: {
      200: {
        type: "object",
        description: "A forum Thread (Comment)",
        properties: {
          ...forumTopicProperties,
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
  deleteForumThread: {
    tags: ["School forum"],
    params: {
      id: { type: "string" },
    },

    response: {
      204: {
        type: "string",
        description: "A forum Thread (Subject to be discussed)",
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

  //School Forum Topic documentation

  createForumTopic: {
    tags: ["School forum"],
    body: {
      type: "object",
      properties: {
        title: { type: "string" },
        body: { type: "string" },
        user_id: { type: "integer" },
        school_forum_category_id: { type: "integer" },
      },
      required: ["body", "user_id", "title"],
    },
    response: {
      200: {
        type: "object",
        description: "A forum Topic (Subject to be discussed)",
        properties: {
          ...forumTopicProperties,
          ...userProperties,
          thread: {
            type: "array",
            items: { type: "object", properties: forumThreadProperties },
          },
        },
      },
    },
  },
  getAllForumTopics: {
    tags: ["School forum"],
    response: {
      200: {
        type: "array",
        description: "A forum Topic (Subject to be discussed)",
        items: {
          type: "object",
          properties: {
            ...forumTopicProperties,
            ...userProperties,
            thread: {
              type: "array",
              items: { type: "object", properties: forumThreadProperties },
            },
          },
        },
      },
    },
  },
  getForumTopic: {
    tags: ["School forum"],
    params: {
      id: { type: "integer" },
    },
    response: {
      200: {
        type: "object",
        description: "A forum Topic (Subject to be discussed)",
        properties: {
          ...forumTopicProperties,
          ...userProperties,
          thread: {
            type: "array",
            items: { type: "object", properties: forumThreadProperties },
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
  updateForumTopic: {
    tags: ["School forum"],
    params: {
      id: { type: "string" },
    },

    body: {
      type: "object",
      properties: { title: { type: "string" }, body: { type: "string" } },
      required: ["title", "body"],
    },
    response: {
      200: {
        type: "object",
        description: "A forum Topic (Subject to be discussed)",
        properties: {
          ...forumTopicProperties,
          ...userProperties,
          thread: {
            type: "array",
            items: { type: "object", properties: forumThreadProperties },
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
  deleteForumTopic: {
    tags: ["School forum"],
    params: {
      id: { type: "string" },
    },

    response: {
      200: {
        type: "object",
        description: "A forum Topic (Subject to be discussed)",
        properties: forumTopicProperties,
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

  // Course forum documentation

  createCourseForumTopic: {
    tags: ["Course forum"],
    body: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        user_id: { type: "integer" },
        course_id: { type: "integer" },
      },
      required: ["description", "user_id", "title", "course_id"],
    },
    response: {
      200: {
        type: "object",
        description: "A forum Topic (Subject to be discussed)",
        properties: {
          ...forumTopicProperties,
          ...userProperties,
          thread: {
            type: "array",
            items: { type: "object", properties: forumThreadProperties },
          },
        },
      },
    },
  },
  getAllCourseForumTopics: {
    tags: ["Course forum"],
    response: {
      200: {
        type: "array",
        description: "A forum Topic (Subject to be discussed)",
        items: {
          type: "object",
          properties: {
            ...forumTopicProperties,
            ...userProperties,
            thread: {
              type: "array",
              items: { type: "object", properties: forumThreadProperties },
            },
          },
        },
      },
    },
  },
  getCourseForumTopic: {
    tags: ["Course forum"],
    params: {
      course_id: { type: "integer" },
    },
    response: {
      200: {
        type: "array",
        description: "A forum Topic (Subject to be discussed)",
        items: {
          type: "object",
          properties: {
            ...forumTopicProperties,
            ...userProperties,
            thread: {
              type: "array",
              items: { type: "object", properties: forumThreadProperties },
            },
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
  updateCourseForumTopic: {
    tags: ["Course forum"],
    params: {
      id: { type: "string" },
    },

    body: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
      },
      required: ["title", "description"],
    },
    response: {
      200: {
        type: "object",
        description: "A forum Topic (Subject to be discussed)",
        properties: {
          ...forumTopicProperties,
          ...userProperties,
          thread: {
            type: "array",
            items: { type: "object", properties: forumThreadProperties },
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
  deleteCourseForumTopic: {
    tags: ["Course forum"],
    params: {
      id: { type: "integer" },
    },

    response: {
      200: {
        type: "object",
        description: "A forum Topic (Subject to be discussed)",
        properties: forumTopicProperties,
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
  //Course Forum Thread documentation

  createCourseForumThread: {
    tags: ["Course forum"],
    body: {
      type: "object",
      properties: {
        body: { type: "string" },
        user_id: { type: "integer" },
        course_forum_topic_id: { type: "integer" },
      },
      required: ["body", "user_id", "course_forum_topic_id"],
    },
    response: {
      200: {
        type: "object",
        description: "A forum Thread (Comment)",

        properties: { ...forumThreadProperties, ...userProperties },
      },
    },
  },
  getAllCourseForumThreads: {
    tags: ["Course forum"],
    params: { course_forum_topic_id: { type: "integer" } },
    response: {
      200: {
        type: "array",
        description: "A forum Thread (Comment)",
        items: {
          type: "object",
          properties: { ...forumThreadProperties, ...userProperties },
        },
      },
    },
  },
  getCourseForumThread: {
    tags: ["Course forum"],
    params: {
      course_forum_topic_id: { type: "integer" },
      id: { type: "string" },
    },
    response: {
      200: {
        type: "object",
        description: "A forum Thread (Comment)",
        properties: { ...forumThreadProperties, ...userProperties },
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
  updateCourseForumThread: {
    tags: ["Course forum"],
    params: {
      id: { type: "string" },
    },

    body: {
      type: "object",
      properties: { body: { type: "string" } },
      required: ["body"],
    },
    response: {
      200: {
        type: "object",
        description: "A forum Thread (Comment)",
        properties: {
          ...forumThreadProperties,
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

  deleteCourseForumThread: {
    tags: ["Course forum"],
    params: {
      id: { type: "string" },
    },

    response: {
      204: {
        type: "string",
        description: "A forum Thread (Subject to be discussed)",
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
};
