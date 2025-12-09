const updateProfile = async (data) => {
  let user = await (
    await fetch(`${process.env.API_URL}/api/user/${data.id}`, {
      //mode: "no-cors",
      method: "put",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        other_name: data.other_name,
      }),
    })
  ).json();

  // console.log(user);
  if (user.error) {
    return null;
  }

  return user;
};

const updateStaffProfile = async (data) => {
  let staff = await (
    await fetch(`${process.env.API_URL}/api/user/${data.id}`, {
      //mode: "no-cors",
      method: "put",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        other_name: data.other_name,
      }),
    })
  ).json();

  // console.log(user);
  if (staff.error) {
    return null;
  }

  return staff;
};
export { updateProfile, updateStaffProfile };
