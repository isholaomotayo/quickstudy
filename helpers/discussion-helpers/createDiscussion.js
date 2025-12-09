import fetch from "isomorphic-unfetch";
const createDisscussionTitle = async data => {
  return await fetch(`${process.env.API_URL}/api/discussionTopic`, {
    //mode: "no-cors",
    method: "post",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      title: data.title,
      body: data.body,
      user_id: data.userId,
      course_id: data.courseId,
      start_date: data.start_date,
      end_date: data.end_date
    })
  })
    .then(res => res.json())
    .then(data => data)
    .catch(e => e);
};

const createDicsussionComment = async data => {
  console.log(data);
  let newThread = await (
    await fetch(`${process.env.API_URL}/api/discussionComment`, {
      //mode: "no-cors",
      method: "post",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        body: data.body,
        user_id: data.userId,
        course_discussion_topic_id: data.topicId
      })
    })
  ).json();

  if (newThread.error) {
    return [];
  }
  return newThread;
};

export { createDisscussionTitle, createDicsussionComment };
