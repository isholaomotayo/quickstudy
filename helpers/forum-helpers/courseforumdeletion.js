import fetch from "isomorphic-unfetch";

const deleteCourseForumTopic = async data => {
  return await fetch(`${process.env.API_URL}/api/courseForumTopic/${data.id}`, {
    //mode: "no-cors",
    method: "delete",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  })
    .then(res => {
      return res;
    })

    .catch(e => {
      console.log(e);
      return e;
    });
};

const deleteCourseForumThread = async data => {
  return await fetch(`${process.env.API_URL}/api/courseForumThread/${data.id}`, {
    //mode: "no-cors",
    method: "delete",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  })
    .then(res => {
      return res;
    })

    .catch(e => {
      console.log(e);
      return e;
    });
};

export { deleteCourseForumTopic, deleteCourseForumThread };
