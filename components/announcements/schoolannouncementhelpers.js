import fetch from "isomorphic-unfetch";

const createSchoolAnnouncement = async data => {
  let announcement;
  try {
    announcement = await fetch(
      `${process.env.API_URL}/api/schoolAnnouncement`,
      {
        //mode: "no-cors",
        method: "post",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          title: data.announcement.title,
          body: data.announcement.body,
          user_id: data.userId,
          institution_id: data.institution_id
        })
      }
    );

    announcement = announcement.status === 200 ? await announcement.json() : {};
  } catch (e) {
    console.log(e);
  }
  return announcement;
};

const updateSchoolAnnouncement = async data => {
  let announcement;
  try {
    announcement = await fetch(
      `${process.env.API_URL}/api/schoolAnnouncement/${data.id}`,
      {
        //mode: "no-cors",
        method: "put",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          title: data.title,
          body: data.body
        })
      }
    );

    announcement = announcement.status === 200 ? await announcement.json() : {};
  } catch (e) {
    console.log(e);
  }

  return announcement;
};

const deleteSchoolAnnouncement = async data => {
  let announcement;

  try {
    announcement = await fetch(
      `${process.env.API_URL}/api/schoolAnnouncement/${data.id}`,
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
  } catch (e) {
    console.log(e);
  }
  return announcement;
};

export {
  createSchoolAnnouncement,
  updateSchoolAnnouncement,
  deleteSchoolAnnouncement
};
