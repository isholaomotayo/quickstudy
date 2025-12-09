import fetch from "isomorphic-unfetch";

const createComment = async data => {
  let comment;

  try {
    comment = await fetch(`${process.env.API_URL}/api/forumThread`, {
      method: "post",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        body: data.comment,
        user_id: data.userId,
        school_forum_topic_id: data.threadId
      })
    });
    comment = comment.status === 201 ? await comment.json() : {};
  } catch (e) {
    console.log(e);
  }

  return comment;
};

const createCategory = async name => {
  let category;
  try {
    category = await fetch(`${process.env.API_URL}/api/forumCategory`, {
      //mode: "no-cors",
      method: "post",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        name
      })
    });

    category = category.status === 200 ? await category.json() : {};
  } catch (e) {
    console.log(e);
  }

  return category;
};
// ${process.env.API_URL}/api/forumTopic

const createThread = async ({ title, body, userId }) => {
  let thread;

  try {
    thread = await fetch(`${process.env.API_URL}/api/forumTopic`, {
      //mode: "no-cors",
      method: "post",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        title,
        body,
        user_id: userId
      })
    });

    thread = thread.status === 200 ? await thread.json() : {};
  } catch (e) {
    console.log(e);
  }
  return thread;
};

export { createComment, createThread, createCategory };
