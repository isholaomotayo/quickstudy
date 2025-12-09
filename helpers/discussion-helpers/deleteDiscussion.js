import fetch from "isomorphic-unfetch";

const deleteCourseDiscussionTopic = async data => {
  return await fetch(`${process.env.API_URL}/api/discussionTopic/${data.id}`, {
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

const deleteDiscussionComment = async data => {
  return await fetch(
    `${process.env.API_URL}/api/discussionComment/${data.id}`,
    {
      //mode: "no-cors",
      method: "delete",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    }
  )
    .then(res => {
      return res;
    })

    .catch(e => {
      console.log(e);
      return e;
    });
};

export { deleteCourseDiscussionTopic, deleteDiscussionComment };
