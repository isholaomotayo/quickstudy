import fetch from "isomorphic-unfetch";

const getStudent = async (id) => {
  let user;
  try {
    user = await fetch(`${process.env.API_URL}/api/student/userid/${id}`, {
      method: "get",
      credentials: "include",
      headers: {},
    });

    user = user.status === 200 ? await user.json() : {};
  } catch (e) {
    console.log(e);
  }

  return user;
};

const getStaff = async (id) => {
  let staff, department;
  try {
    staff = await fetch(`${process.env.API_URL}/api/staff?user_id=${id}`, {
      method: "get",
      credentials: "include",
      headers: {},
    });

    department = await fetch(`${process.env.API_URL}/api/department`, {
      method: "get",
      credentials: "include",
      headers: {},
    });

    staff = staff.status === 200 ? await staff.json() : [];
    department = department.status === 200 ? await department.json() : [];
  } catch (e) {
    console.log(e);
  }

  return { staff, department };
};

const updateBulk = async (updateData, userData, endPoint = "") => {
  let response, student, user, staff, affiliate;
  const value = {};

  let tempUser = {
    ...userData,
  };
  if (userData.phone === null) {
    delete tempUser.phone;
  }
  try {
    user = await fetch(`${process.env.API_URL}/api/user/${userData.id}`, {
      //mode: "no-cors",
      method: "put",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        ...tempUser,
      }),
    });

    user = user.status === 200 ? await user.json() : {};

    value.user = user;

    if (endPoint === "student") {
      const data = {
        dob: updateData.dob,
        reg_no: updateData.reg_no,
        gender: updateData.gender,
        marital_status: updateData.marital_status,
        employment_status: updateData.employment_status,
        address: updateData.address,
        inst_type: updateData.inst_type,
        inst_name: updateData.inst_name,
        degree_grade: updateData.degree_grade,
        grad_year: updateData.grad_year,
        type_degree: updateData.type_degree,
        course_studied: updateData.course_studied,
      };

      student = await fetch(
        `${process.env.API_URL}/api/student/${updateData.id}`,
        {
          //mode: "no-cors",
          method: "put",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            ...data,
          }),
        }
      );

      response =
        student.status === 200 && user.status === 200 ? "success" : "failed";

      student = student.status === 200 ? await student.json() : {};

      value.response = response;
      value.student = student;
    }

    if (endPoint === "staff") {
      const data = {
        gender: updateData.gender,
        address: updateData.address,
        designation: updateData.designation,
        level: updateData.level,
      };

      staff = await fetch(`${process.env.API_URL}/api/staff/${updateData.id}`, {
        //mode: "no-cors",
        method: "put",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          ...data,
        }),
      });
      response =
        staff.status === 200 && user.status === 200 ? "success" : "failed";

      staff = staff.status === 200 ? await staff.json() : {};

      value.response = response;
      value.staff = staff;
    }

    if (endPoint === "affiliate") {
      affiliate = await fetch(
        `${process.env.API_URL}/api/affiliate/${updateData.id}`,
        {
          method: "put",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            ...updateData,
          }),
        }
      );

      response =
        affiliate.status === 200 && user.status === 200 ? "success" : "failed";

      affiliate = affiliate.status === 200 ? await affiliate.json() : {};

      value.response = response;
      value.affiliate = affiliate;
    }
  } catch (e) {
    console.log(e);
  }

  return value;
};

const Sort = (data) => {
  let temp = [];

  temp = data.sort((a, b) => {
    return a.first_name.trim().toLowerCase() > b.first_name.trim().toLowerCase()
      ? 1
      : b.first_name.trim().toLowerCase() > a.first_name.trim().toLowerCase()
      ? -1
      : 0;
  });

  return temp;
};

export { getStudent, updateBulk, getStaff, Sort };
