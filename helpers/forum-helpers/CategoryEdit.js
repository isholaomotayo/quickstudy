const updateComment = async comment => {
  return await fetch(`  ${process.env.API_URL}/api/forumThread/${comment.id}`, {
    //mode: "no-cors",
    method: "put",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      body: comment.body
    })
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

const updateThread = async thread => {
  let threadUpdate;

  try {
    threadUpdate = await fetch(
      `${process.env.API_URL}/api/forumTopic/${thread.id}`,
      {
        //mode: "no-cors",
        method: "put",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          title: thread.title,
          body: thread.body,
          user_id: thread.user.id
        })
      }
    );
    threadUpdate = threadUpdate.status === 200 ? await threadUpdate.json() : {};
  } catch (e) {
    console.log(e);
  }

  return threadUpdate;
};

const updateTopic = async topic => {
  let category;

  try {
    category = await fetch(
      `${process.env.API_URL}/api/forumCategory/${topic.id}`,
      {
        //mode: "no-cors",
        method: "put",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          name: topic.name
        })
      }
    );

    category = category.status === 200 ? await category.json() : {};
  } catch (e) {
    console.log(e);
  }
  return category;
};

export { updateTopic, updateThread, updateComment };
