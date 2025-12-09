const courseProperties = {
  id: { type: "integer" },
  name: { type: "string" },
  created_at: { type: "string" },
  updated_at: { type: "string" },
};

const discussionTopicProperties = {
  id: { type: "integer" },
  body: { type: "string" },
  user_id: { type: "integer" },
  course_id: { type: "integer" },
  title: { type: "string" },
  start_date: { type: "string" },
  end_date: { type: "string" },
  created_at: { type: "string" },
  updated_at: { type: "string" },
  course: { type: "object", properties: courseProperties },
};

const discussionCommentProperties = {
  id: { type: "integer" },
  course_discussion_topic_id: { type: "integer" },
  user_id: { type: "integer" },
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
  createCourseDiscussionTopic: {
    tags: ["Course Discussion"],
    body: {
      type: "object",
      properties: {
        title: { type: "string" },
        body: { type: "string" },
        start_date: { type: "string" },
        end_date: { type: "string" },
        user_id: { type: "integer" },
        course_id: { type: "integer" },
      },
      required: [
        "title",
        "body",
        "start_date",
        "end_date",
        "course_id",
        "user_id",
      ],
    },
    response: {
      200: {
        type: "object",
        description: "Course discussions",
        properties: {
          ...discussionTopicProperties,
          ...userProperties,
          comment: {
            type: "array",
            items: {
              type: "object",
              properties: { ...discussionCommentProperties, ...userProperties },
            },
          },
        },
      },
    },
  },
  getAllCourseDiscussionTopics: {
    tags: ["Course Discussion"],

    response: {
      200: {
        type: "array",

        description: "Course discussions",
        items: {
          type: "object",
          properties: {
            ...discussionTopicProperties,
            ...userProperties,
            comment: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  ...discussionCommentProperties,
                  ...userProperties,
                },
              },
            },
          },
        },
      },
    },
  },
  getCourseDiscussionTopic: {
    tags: ["Course Discussion"],
    params: { course_id: { type: "string" } },
    response: {
      200: {
        type: "array",
        description: "Course discussions",
        items: {
          type: "object",
          properties: {
            ...discussionTopicProperties,
            comment: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  ...discussionCommentProperties,
                  ...userProperties,
                },
              },
            },
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
  updateCourseDiscussionTopic: {
    tags: ["Course Discussion"],
    params: { id: { type: "integer" } },
    body: {
      type: "object",
      properties: {
        title: { type: "string" },
        body: { type: "string" },
        start_date: { type: "string" },
        end_date: { type: "string" },
      },
      // required: ["title", "body"]
    },
    response: {
      200: {
        type: "object",
        description: "A Discussion Topic (Comment)",
        properties: {
          ...discussionTopicProperties,
          ...userProperties,
          comment: {
            type: "array",
            items: {
              type: "object",
              properties: { ...discussionCommentProperties, ...userProperties },
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
  deleteCourseDiscussionTopic: {
    tags: ["Course Discussion"],
    params: {
      id: { type: "string" },
    },

    response: {
      204: {
        type: "string",
        description: "A Course Discussion (Subject to be discussed)",
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
  //Course Discussion comment documentation

  createCourseDiscussionComment: {
    tags: ["Course Discussion"],
    body: {
      type: "object",
      properties: {
        body: { type: "string" },
        user_id: { type: "integer" },
        course_discussion_topic_id: { type: "integer" },
      },
      required: ["body", "user_id", "course_discussion_topic_id"],
    },
    response: {
      200: {
        type: "object",
        description: "A course discussion (Comment)",

        properties: { ...discussionCommentProperties, ...userProperties },
      },
    },
  },
  getAllCourseDiscussionComments: {
    tags: ["Course Discussion"],
    // params: { course_discussion_topic_id: { type: "integer" } },
    response: {
      200: {
        type: "array",
        description: "A collection of course discussion (Comments)",
        items: {
          type: "object",
          properties: { ...discussionCommentProperties, ...userProperties },
        },
      },
    },
  },
  getCourseDiscussionComment: {
    tags: ["Course Discussion"],
    params: {
      course_discussion_topic_id: { type: "string" },
    },
    response: {
      200: {
        type: "array",
        description: "Course discussions",
        items: {
          type: "object",
          properties: {
            ...discussionCommentProperties,
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
  updateCourseDiscussionComment: {
    tags: ["Course Discussion"],
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
        description: "A Discussion Topic (Comment)",
        properties: {
          ...discussionCommentProperties,
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
  deleteCourseDiscussionComment: {
    tags: ["Course Discussion"],
    params: {
      id: { type: "string" },
    },

    response: {
      204: {
        type: "string",
        description: "A course discussion (Subject to be discussed)",
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
