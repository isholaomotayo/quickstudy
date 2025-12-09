const manageUsers = async data => {
  let users;

  try {
    users = await fetch(`${process.env.API_URL}/api/user/${data.id}`, {
      method: "put",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        ...data
      })
    });

    users =
      users.status === 200
        ? await fetch(`${process.env.API_URL}/api/user`, {
            method: "get",
            credentials: "include",
            headers: {}
          })
        : [];

    users = users.status === 200 ? await users.json() : [];

    users = users.filter(
      x => Number(x.institution_id) === Number(data.institution_id)
    );

    users = users.sort((a, b) => a.first_name - b.first_name);
  } catch (e) {
    console.log(e);
  }

  return users;
};

export default manageUsers;
