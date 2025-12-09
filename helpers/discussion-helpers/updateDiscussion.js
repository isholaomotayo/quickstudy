import fetch from "isomorphic-unfetch";

const updateCourseDiscussionTopic = async data => {
  return await fetch(`${process.env.API_URL}/api/discussionTopic/${data.id}`, {
    //mode: "no-cors",
    method: "put",
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

const updateCourseDiscussionComment = async data => {
  return await fetch(
    `${process.env.API_URL}/api/discussionComment/${data.id}`,
    {
      //mode: "no-cors",
      method: "put",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        body: data.body
      })
    }
  )
    .then(res => res.json())
    .then(data => data)
    .catch(e => e);
};
export { updateCourseDiscussionTopic, updateCourseDiscussionComment };
