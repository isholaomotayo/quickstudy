const deleteComment = async id => {
  return await fetch(`${process.env.API_URL}/api/forumThread/${id}`, {
    //mode: "no-cors",
    method: "delete",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  })
    .then(res => res.json())
    .then(data => {
      return data;
    })
    .catch(e => {
      console.log(e);
      return e;
    });
};

const deleteThread = async thread => {
  let deletedThread;

  try {
    deletedThread = await fetch(
      `${process.env.API_URL}/api/forumTopic/${thread.id}`,
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
    );

    deletedThread = deletedThread.status === 204 ? deletedThread : {};
  } catch (e) {
    console.log(e);
  }
  return deletedThread;
};

const deleteCategory = async id => {
  console.log(id);
  return await fetch(`${process.env.API_URL}/api/forumCategory/${id}`, {
    //mode: "no-cors",
    method: "delete",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  })
    .then(res => res)
    .catch(e => {
      return e;
    });
};

export { deleteComment, deleteThread, deleteCategory };
