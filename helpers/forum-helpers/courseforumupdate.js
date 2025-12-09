import fetch from "isomorphic-unfetch";

const updateCourseForumTopic = async data => {
  return await fetch(`${process.env.API_URL}/api/courseForumTopic/${data.id}`, {
    //mode: "no-cors",
    method: "put",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      title: data.title,
      description: data.description
    })
  })
    .then(res => res.json())
    .then(data => data)
    .catch(e => e);
};

const updateCourseForumThread = async data => {
  return await fetch(`${process.env.API_URL}/api/courseForumThread/${data.id}`, {
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
  })
    .then(res => res.json())
    .then(data => data)
    .catch(e => e);
};
export { updateCourseForumTopic, updateCourseForumThread };
