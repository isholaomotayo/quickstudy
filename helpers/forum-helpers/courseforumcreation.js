import fetch from "isomorphic-unfetch";
const createCourseForumThread = async data => {
  return await fetch(`${process.env.API_URL}/api/courseForumThread`, {
    //mode: "no-cors",
    method: "post",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      body: data.thread.body,
      user_id: data.userId,
      course_forum_topic_id: data.topicId
    })
  })
    .then(res => res.json())
    .then(data => data)
    .catch(e => e);
};

const createCourseForumTopic = async data => {
  console.log(data);
  let topic, allTopics;

  try {
    topic = await fetch(`${process.env.API_URL}/api/courseForumTopic`, {
      //mode: "no-cors",
      method: "post",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        title: data.topicData.title,
        description: data.topicData.description,
        user_id: Number(data.userId),
        course_id: data.courseId
      })
    });
    console.log(topic);

    topic = topic.status === 200 ? await topic.json() : {};

    allTopics = await fetch(
      `${process.env.API_URL}/api/courseForumTopic/${data.courseId}`,
      {
        method: "get",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );

    allTopics = allTopics.status === 200 ? await allTopics.json() : [];
    allTopics = allTopics.sort((a, b) => b.id - a.id);
  } catch (e) {
    console.log(e);
  }

  return allTopics;
};

export { createCourseForumTopic, createCourseForumThread };
