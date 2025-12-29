import fetch from "isomorphic-unfetch";
import { getCookies, setCookies } from "cookies-next";
import Router from "next/router";

export const getAuthData = (req) => {
  const { token = "", role = "", userId = 0 } = getCookies({ req }) || {};

  return token ? { userRole: role, userId, authToken: token } : false;
};

// returns cost to be sent to apyment gateway in kobo
export const getNewTransactionAmount = (amount) => {
  let trxnCost = 0;
  amount = Number(amount);
  if (amount >= 134000) {
    trxnCost = amount + 2000;
  } else if (amount < 134000 && amount > 2499) {
    trxnCost = (amount + 100) * (1 / 0.985);
  } else if (amount < 2000) {
    trxnCost = amount * (1 / 0.985);
  } else {
    trxnCost = amount * (1 / 0.985) + 100;
  }
  return (trxnCost + 5).toFixed(2);
};

export const getReference = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15) +
  Date.now().toString(36);

//generate matric/reg number for student
export const generateRegNo = (studentId) => {
  let lastRegNo = "PG/MBA/DL/18/85";
  let result = lastRegNo.split("/");
};

// Function to login using email and password
export const userLogin = async (props, req = {}) => {
  //endpoint to login
  return await fetch(`${process.env.API_URL}/api/login`, {
    method: "post",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify({
      email: props.email,
      password: props.password,
    }),
  });
};
export const getAllInstitutions = (req = {}) =>
  fetch(`${process.env.API_URL}/api/institution`, {
    method: "get",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  })
    .then((response) => response.json())
    .then((json) => {
      return { json };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });

export const getInstitutionById = (institutionId, req = {}) =>
  fetch(`${process.env.API_URL}/api/institution/${institutionId}`, {
    method: "get",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  })
    .then((response) => response.json())
    .then((json) => {
      return { institution: json };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });
//check that an enterred referral code exists
export const verifyRefCode = (referralCode, req = {}) =>
  fetch(`${process.env.API_URL}/api/user/username/${referralCode}`, {
    method: "get",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  });

export const updateInstitution = async (props, req = {}) => {
  const { id } = props;
  delete props.id;
  return await fetch(`${process.env.API_URL}/api/institution/${id}`, {
    method: "put",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify({
      ...props,
    }),
  })
    .then((response) => response.json())
    .then((json) => {
      return { updatedInstitution: json };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });
};
// Function to get all programmes
export const getAllProgrammes = async (req = {}) =>
  //endpoint to fetch all programmes in the Institution
  fetch(`${process.env.API_URL}/api/programme`, {
    method: "get",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  })
    .then((response) => response.json())
    .then((json) => {
      return { programmes: json };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });

// Function to get all levels
export const getAllLevels = async (req = {}) =>
  //endpoint to fetch all levels in the Institution
  fetch(`${process.env.API_URL}/api/level`, {
    method: "get",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  })
    .then((response) => response.json())
    .then((json) => {
      return { levels: json };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });

// Function to get all applications
export const getAllApplications = (req = {}) =>
  //endpoint to fetch all applications currently running in the Institution
  // for now, we're using programmes
  fetch(`${process.env.API_URL}/api/programme`, {
    method: "get",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  })
    .then((response) => response.json())
    .then((json) => {
      return { json };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });

//fetch fee by id
export const getFeeById = async (id, req = {}) => {
  return await fetch(`${process.env.API_URL}/api/fee/${id}`, {
    method: "get",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  })
    .then((response) => response.json())
    .then((json) => {
      return { fee: json };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });
};

//fetch course by id
export const getCourseById = async (id, req = {}) => {
  return await fetch(`${process.env.API_URL}/api/course/${id}`, {
    method: "get",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  })
    .then((response) => response.json())
    .then((json) => {
      return { course: json };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });
};

// Function to get a Student by id
export const getStudentById = async (studentId, req = {}) => {
  //endpoint to fetch all students using id
  return await fetch(`${process.env.API_URL}/api/student/${studentId}`, {
    method: "get",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  })
    .then((response) => response.json())
    .then((json) => {
      return { student: json };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });
};

// Function to get a Student by user_id
export const getStudentByUserId = async (userId, req = {}) => {
  //endpoint to fetch all students using user_id
  return await fetch(`${process.env.API_URL}/api/student/userid/${userId}`, {
    method: "get",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  })
    .then((response) => response.json())
    .then((json) => {
      return { student: json };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });
};

// Function to get admit a Student applicant
export const admitStudent = async (props, req = {}) => {
  delete props.user;
  delete props.programme;
  delete props.semester;
  delete props.reg_no;
  //endpoint to update  a students using id
  return await fetch(`${process.env.API_URL}/api/student/${props.id}`, {
    method: "put",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify({
      ...props,
    }),
  });
};

export const admitStudentOld = async (props, req = {}) => {
  //endpoint to fetch all students using id

  return await fetch(`${process.env.API_URL}/api/student/${props.id}`, {
    method: "put",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify({
      admitted: true,
      semester_admitted_id: props.semesterAdmittedId,
      entry_level_id: props.entryLevelId,
    }),
  });
};

// Function to get a Student Results by search params
export const getStudentResultsByParams = async (searchParams, req = {}) => {
  //endpoint to fetch all students using id
  return await fetch(
    `${process.env.API_URL}/api/studentresult?${searchParams}`,
    {
      method: "get",
      credentials: "include",
      headers:
        req && req.headers && req.headers.cookie
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
    }
  );
};

// Function to get Student Courses by search params
export const getStudentCoursesByParams = async (searchParams, req = {}) => {
  //endpoint to fetch all students using id
  return await fetch(
    `${process.env.API_URL}/api/studentcourse?${searchParams}`,
    {
      method: "get",
      credentials: "include",
      headers:
        req && req.headers && req.headers.cookie
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
    }
  );
};

// Function to get available semesters for a course (more efficient than fetching all student courses)
export const getCourseSemesters = async (courseId, req = {}) => {
  return await fetch(
    `${process.env.API_URL}/api/studentcourse/course/${courseId}/semesters`,
    {
      method: "get",
      credentials: "include",
      headers:
        req && req.headers && req.headers.cookie
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
    }
  );
};

// Function to get a Student Gpas by studentid
export const getStudentGpasByStudentId = async (studentId, req = {}) => {
  //endpoint to fetch all students using id
  return await fetch(
    `${process.env.API_URL}/api/studentgpa/studentid/${studentId}`,
    {
      method: "get",
      credentials: "include",
      headers:
        req && req.headers && req.headers.cookie
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
    }
  );
};

//update student using data provided
export const updateStudent = async (props, req = {}) => {
  let payload = {};
  if (props.student.address) payload.address = props.student.address;
  if (props.student.gender) payload.gender = props.student.gender.toLowerCase();
  if (props.student.marital_status)
    payload.marital_status = props.student.marital_status;
  if (props.student.employment_status)
    payload.employment_status = props.student.employment_status;
  if (props.student.id_card) payload.id_card = props.student.id_card;
  if (props.student.state_origin)
    payload.state_origin = props.student.state_origin;
  if (props.student.state_residence)
    payload.state_residence = props.student.state_residence;
  if (props.student.lga_origin) payload.lga_origin = props.student.lga_origin;
  if (props.student.lga_residence)
    payload.lga_residence = props.student.lga_residence;
  if (props.student.programme_id)
    payload.programme_id = props.student.programme_id;
  if (props.student.dob) payload.dob = props.student.dob;
  if (props.student.inst_cert) payload.inst_cert = props.student.inst_cert;
  if (props.student.grad_year) payload.grad_year = props.student.grad_year;

  if (props.student.degree_grade)
    payload.degree_grade = props.student.degree_grade;
  if (props.student.type_degree)
    payload.type_degree = props.student.type_degree;
  if (props.student.course_studied)
    payload.course_studied = props.student.course_studied;
  if (props.student.inst_type) payload.inst_type = props.student.inst_type;
  if (props.student.inst_name) payload.inst_name = props.student.inst_name;
  if (props.student.status) payload.status = props.student.status;
  if (props.student.entry_level_id)
    payload.entry_level_id = props.student.entry_level_id;

  return await fetch(`${process.env.API_URL}/api/student/${props.student.id}`, {
    //mode: "no-cors",
    method: "put",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((json) => {
      return { updatedStudent: json };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });
};

// Function to change user role
export const setUserRole = async (userId, userRole, req = {}) => {
  //endpoint to fetch all students using id
  return await fetch(`${process.env.API_URL}/api/user/${userId}`, {
    method: "put",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify({
      role: userRole,
    }),
  });
};

// Function to get all applicants
export const getApplicants = async (req = {}) => {
  //endpoint to fetch all students using user_id
  return await fetch(`${process.env.API_URL}/api/user/applicant`, {
    method: "get",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  })
    .then((response) => response.json())
    .then((json) => {
      return { applicants: json };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });
};
// Function to get a Staff by user_id
export const getStaffByUserId = async (userId, req = {}) => {
  //endpoint to fetch all students using user_id
  return await fetch(`${process.env.API_URL}/api/staff?user_id=${userId}`, {
    method: "get",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  })
    .then((response) => response.json())
    .then((json) => {
      return { staff: json[0] };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });
};

// Function to get the current semester
export const getCurrentSemester = async (req = {}) => {
  //endpoint to fetch all students using user_id
  return await fetch(`${process.env.API_URL}/api/semester?is_active=true`, {
    method: "get",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  })
    .then((response) => response.json())
    .then((json) => {
      return { semester: json[0] };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });
};
// Function to get a Student Level ID using centralized backend calculation
export const getStudentLevelId = async (
  semesterAdmitted,
  currentSemester,
  entryLevelId,
  req = {}
) => {
  try {
    // Use the centralized backend API for level calculation
    const response = await fetch(
      `${process.env.API_URL}/api/student/level/calculate?student_id=0&semester_admitted_id=${semesterAdmitted}&entry_level_id=${entryLevelId}`,
      {
        method: "get",
        credentials: "include",
        headers:
          req && req.headers && req.headers.cookie
            ? { cookie: req.headers.cookie }
            : {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
      }
    );

    if (response.ok) {
      const levelData = await response.json();
      return levelData.levelId;
    } else {
      console.error("Failed to calculate level via API, using fallback");
      return parseInt(entryLevelId);
    }
  } catch (error) {
    console.error("Error calling level calculation API:", error);
    return parseInt(entryLevelId); // Fallback to entry level
  }
};

// Function to update user avatar
export const updateUserAvatar = async (url, userId, req = {}) => {
  return await fetch(`${process.env.API_URL}/api/user/${userId}`, {
    method: "put",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify({
      avatar: url,
    }),
  })
    .then((response) => response.json())
    .then((json) => {
      return { updatedUser: json };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });
};
// Function to update student id card file
export const updateStudentIdFile = async (url, studentId, req = {}) => {
  return await fetch(`${process.env.API_URL}/api/student/${studentId}`, {
    method: "put",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify({
      id_card: url,
    }),
  })
    .then((response) => response.json())
    .then((json) => {
      return { updatedUser: json };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });
};

// Function to update student cert file
export const updateStudentCertFile = async (url, studentId, req = {}) => {
  return await fetch(`${process.env.API_URL}/api/student/${studentId}`, {
    method: "put",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify({
      inst_cert: url,
    }),
  })
    .then((response) => response.json())
    .then((json) => {
      return { updatedUser: json };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });
};
// Function to send reset password link to email
export const sendForgotPasswordLink = async (props, req = {}) => {
  return await fetch(`${process.env.API_URL}/api/startPasswordReset`, {
    method: "post",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify({
      email: props.email,
    }),
  });
};

// Function to reset password using reset code
export const resetPassword = async (props, req = {}) => {
  return await fetch(`${process.env.API_URL}/api/resetPassword`, {
    method: "post",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify({
      password: props.newPassword,
      resetCode: props.resetCode,
    }),
  });
};
export const postUser = async (props, req = {}) => {
  const postBody = {
    first_name: props.firstName,
    last_name: props.lastName,
    other_name: props.otherName,
    phone: props.phone,
    email: props.email,
    username: props.username,
    password: props.password,
    referral_code: props.referral_code,
    institution_id: props.institution_id,
  };

  if (props.role) postBody.role = props.role;

  return await fetch(`${process.env.API_URL}/api/user`, {
    method: "post",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify(postBody),
  })
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      return { newUser: json };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });
};

// delete user by id
export const deleteUser = async (userId, req = {}) => {
  return await fetch(`${process.env.API_URL}/api/user/${userId}`, {
    method: "delete",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  });
};
// Save student draft (for progress saving)
export const saveStudentDraft = async (props, req = {}) => {
  // Only send fields that exist in the student table
  const studentData = {
    user_id: props.user_id,
    gender: props.gender?.toLowerCase(),
    dob: props.dateOfBirth,
    address: props.address,
    state_origin: props.stateOfOrigin,
    lga_origin: props.localGovernment,
    state_residence: props.state,
    lga_residence: props.city,
    marital_status: props.maritalStatus,
    employment_status: props.employmentStatus,
    id_card: props.identityDocument,
    inst_cert: props.certificates,
    grad_year: props.graduationYear,
    degree_grade: props.degreeGrade,
    type_degree: props.degreeType,
    course_studied: props.courseStudied,
    inst_type: props.institutionType,
    inst_name: props.previousInstitution,
    programme_id:
      props.preferredProgram && props.preferredProgram !== ""
        ? parseInt(props.preferredProgram)
        : null,
    ref_fname: props.ref_fname || null,
    ref_lname: props.ref_lname || null,
    ref_phone: props.ref_phone || null,
    ref_address: props.ref_address || null,
    status: false, // Set to false for draft/progress saving
  };

  // First, check if student already exists
  const existingStudentResponse = await fetch(
    `${process.env.API_URL}/api/student/userid/${props.user_id}`,
    {
      method: "GET",
      credentials: "include",
      headers:
        req && req.headers && req.headers.cookie
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
    }
  );

  let studentId = null;
  if (existingStudentResponse.ok) {
    const existingStudent = await existingStudentResponse.json();
    studentId = existingStudent.id;
  }

  // Use PUT if student exists, POST if creating new
  const method = studentId ? "PUT" : "POST";
  const url = studentId
    ? `${process.env.API_URL}/api/student/${studentId}`
    : `${process.env.API_URL}/api/student`;

  return await fetch(url, {
    method: method,
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify(studentData),
  })
    .then((response) => response.json())
    .then((json) => {
      return { newStudent: json };
    })
    .catch((e) => {
      console.log(e);
      throw e;
    });
};

export const postStudent = async (props, req = {}) => {
  // Only send fields that exist in the student table
  const studentData = {
    user_id: props.user_id,
    gender: props.gender?.toLowerCase(),
    dob: props.dateOfBirth,
    address: props.address,
    state_origin: props.stateOfOrigin,
    lga_origin: props.localGovernment,
    state_residence: props.state,
    lga_residence: props.city,
    marital_status: props.maritalStatus,
    employment_status: props.employmentStatus,
    id_card: props.identityDocument,
    inst_cert: props.certificates,
    grad_year: props.graduationYear,
    degree_grade: props.degreeGrade,
    type_degree: props.degreeType,
    course_studied: props.courseStudied,
    inst_type: props.institutionType,
    inst_name: props.previousInstitution,
    programme_id:
      props.preferredProgram && props.preferredProgram !== ""
        ? parseInt(props.preferredProgram)
        : null,
    ref_fname: props.ref_fname || null,
    ref_lname: props.ref_lname || null,
    ref_phone: props.ref_phone || null,
    ref_address: props.ref_address || null,
    status: true, // Set to true to indicate application process is complete
  };

  // First, check if student already exists
  const existingStudentResponse = await fetch(
    `${process.env.API_URL}/api/student/userid/${props.user_id}`,
    {
      method: "GET",
      credentials: "include",
      headers:
        req && req.headers && req.headers.cookie
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
    }
  );

  let studentId = null;
  if (existingStudentResponse.ok) {
    const existingStudent = await existingStudentResponse.json();
    studentId = existingStudent.id;
  }

  // Use PUT if student exists, POST if creating new
  const method = studentId ? "PUT" : "POST";
  const url = studentId
    ? `${process.env.API_URL}/api/student/${studentId}`
    : `${process.env.API_URL}/api/student`;

  return await fetch(url, {
    method: method,
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify(studentData),
  })
    .then((response) => response.json())
    .then((json) => {
      // console.log(json);
      return { newStudent: json };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });
};
//function to create a new affiliate record
export const postAffiliate = async (props, req = {}) => {
  let data = {};
  if (props.user_id) data.user_id = props.user_id;
  if (props.bank) data.bank = props.bank;
  if (props.account_no) data.account_no = props.account_no;

  let postURL = `${process.env.API_URL}/api/affiliate`;
  if (props.id) postURL += `/${props.id}`;

  return await fetch(postURL, {
    method: props.id ? "put" : "post",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((json) => {
      return { newAffiliate: json };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });
};
export const postStaff = async (props, req = {}) => {
  return await fetch(`${process.env.API_URL}/api/staff`, {
    method: "post",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify({
      staff_no: props.staff_no,
      level: props.level,
      address: props.address,
      designation: props.designation,
      first_name: props.firstName,
      last_name: props.lastName,
      other_name: props.otherName,
      phone: props.phone,
      email: props.email,
      username: props.username,
      password: props.password,
      role: props.role,
      institution_id: parseInt(props.institution_id),
      department_id: parseInt(props.department_id),
    }),
  });
};
export const postStaffCourse = async (props, req = {}) => {
  return await fetch(`${process.env.API_URL}/api/staffcourse`, {
    method: "post",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify({
      staff_id: props.staffIds,
      course_id: props.courseIds,
    }),
  });
};
export const postFeeStudent = async (props, req = {}) => {
  return await fetch(`${process.env.API_URL}/api/feestudent`, {
    method: "post",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify({
      fee_id: props.fee_id,
      fee: props.feesJsonData,
      phone: props.phone,
      email: props.email,
      username: props.username,
      password: props.password,
    }),
  })
    .then((response) => response.json())
    .then((json) => {
      // console.log(json);
      return { newUser: json };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });
};
export const verifyStudent = async (
  req,
  res,
  allowedRoles = [],
  bounceTo = "/signin?logout=1"
) => {
  /* Bounces users with incomplete records eg users without student profile from a page 
    or returns token assets for authorized user and student profile. 
    */
  let {
    token = "",
    role = "",
    userId = 0,
    userData = "{}",
  } = getCookies({ req }) || {};
  userData = JSON.parse(decodeURIComponent(userData));

  const bounce = () => {
    if (res) {
      res.writeHead(302, {
        Location: bounceTo,
      });
      res.end();
    } else {
      Router.push(bounceTo);
    }
  };
  const { student } = await getStudentByUserId(userId, req);

  if (!role || allowedRoles.indexOf(role) < 0 || !student) bounce();

  return { token, role, userId, userData, student };
};
export async function GetFetch(url, req = {}) {
  await fetch(url, {
    method: "get",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  })
    .then((response) => response.json())
    .then((json) => {
      // console.log(json);

      return { json };
    })
    .catch((e) => {
      console.log(e);
      // return e;
    });
}
export async function PostFetch(url, req = {}) {
  await fetch(url, {
    method: "post",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  });
}
export async function DeleteFetch(url, req = {}) {
  await fetch(url, {
    method: "delete",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  });
}

/**
 * Get API base URL - use relative URL for same-origin requests, or env var for external API
 */
function getApiUrl() {
  // In browser/client-side, always use relative URL for Next.js API routes
  if (typeof window !== "undefined") {
    return ""; // Relative URL - same origin
  }
  // Server-side: use environment variable or default
  // Check NEXT_PUBLIC_API_URL first (available on client), then API_URL (server-only)
  return process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "";
}

export async function getInstituionByParams(data, ctx) {
  let institution;

  try {
    const apiBaseUrl = getApiUrl();
    // Use relative URL if apiBaseUrl is empty (client-side), otherwise use full URL
    const apiUrl = apiBaseUrl
      ? `${apiBaseUrl}/api/institution/params`
      : "/api/institution/params";

    institution = await fetch(apiUrl, {
      method: "post",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        ...data,
      }),
    });

    if (institution.status === 200) {
      const jsonData = await institution.json();
      // Check if response has error
      if (jsonData && jsonData.error) {
        console.warn("Institution API returned error:", jsonData.error);
        institution = null;
      } else {
        institution = jsonData;
      }
    } else {
      console.warn(`Institution API returned status ${institution.status}`);
      institution = null;
    }
  } catch (e) {
    console.error("Error fetching institution:", e);
    institution = null;
  }

  // Only set cookie if we have a valid institution with an ID
  if (institution && typeof institution === "object" && institution.id) {
    const institutionId = institution.id;
    setCookies(ctx, "institutionId", institutionId);
  }

  return institution;
}

// Function to add a student result
export const addStudentResult = async (resultData, req = {}) => {
  return await fetch(`${process.env.API_URL}/api/studentresult`, {
    method: "POST",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? {
            cookie: req.headers.cookie,
            "Content-Type": "application/json",
          }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify(resultData),
  });
};

// Function to add multiple student results in batch (using same endpoint)
export const addStudentResultsBatch = async (resultsData, req = {}) => {
  return await fetch(`${process.env.API_URL}/api/studentresult`, {
    method: "POST",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? {
            cookie: req.headers.cookie,
            "Content-Type": "application/json",
          }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify(resultsData),
  });
};

// Function to get all grades
export const getGrades = async (req = {}) => {
  return await fetch(`${process.env.API_URL}/api/grade`, {
    method: "GET",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  });
};

// Function to get courses by params
export const getCoursesByParams = async (searchParams, req = {}) => {
  return await fetch(`${process.env.API_URL}/api/course?${searchParams}`, {
    method: "GET",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  });
};

// Function to calculate student GPA
export const calculateStudentGpa = async (gpaData, req = {}) => {
  return await fetch(`${process.env.API_URL}/api/studentgpa/calculate`, {
    method: "POST",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? {
            cookie: req.headers.cookie,
            "Content-Type": "application/json",
          }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    body: JSON.stringify(gpaData),
  });
};

// Function to get students by params
export const getStudentsByParams = async (searchParams, req = {}) => {
  return await fetch(`${process.env.API_URL}/api/student?${searchParams}`, {
    method: "GET",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  });
};

// Function to get all levels
export const getLevels = async (req = {}) => {
  return await fetch(`${process.env.API_URL}/api/level`, {
    method: "GET",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  });
};

// Function to get all semesters
export const getSemesters = async (req = {}) => {
  return await fetch(`${process.env.API_URL}/api/semester`, {
    method: "GET",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  });
};

// Function to get all sessions
export const getSessions = async (req = {}) => {
  return await fetch(`${process.env.API_URL}/api/session`, {
    method: "GET",
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
  });
};

// Function to get student GPAs by search params
export const getStudentGpasBySearchParams = async (searchParams, req = {}) => {
  return await fetch(
    `${process.env.API_URL}/api/studentgpa/search?${searchParams}`,
    {
      method: "GET",
      credentials: "include",
      headers:
        req && req.headers && req.headers.cookie
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
    }
  );
};

// Function to download CSV template for result upload
export const downloadResultTemplate = async (courseId, req = {}) => {
  const response = await fetch(
    `${process.env.API_URL}/api/studentresult/template/${courseId}`,
    {
      method: "GET",
      credentials: "include",
      headers:
        req && req.headers && req.headers.cookie
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
    }
  );

  if (response.ok) {
    const blob = await response.blob();
    return blob;
  }
  throw new Error("Failed to download template");
};

// Helper function to calculate grade based on score and grades configuration
export const calculateGradeFromScore = (score, grades) => {
  const numScore = parseFloat(score);
  if (isNaN(numScore)) return { letter: "F", id: null };

  if (!grades || grades.length === 0) {
    console.error("No grades configuration available");
    return { letter: null, id: null };
  }

  // Sort grades by min_score descending to check from highest to lowest
  const sortedGrades = [...grades].sort((a, b) => b.min_score - a.min_score);

  // Find the appropriate grade based on score range
  for (let grade of sortedGrades) {
    if (numScore >= grade.min_score && numScore <= grade.max_score) {
      return { letter: grade.name, id: grade.id };
    }
  }

  // If no grade found, try to find F grade as fallback
  const fGrade = grades.find((g) => g.name.toUpperCase() === "F");
  if (fGrade) {
    console.warn(
      `Score ${numScore} does not fit any grade range, defaulting to F`
    );
    return { letter: "F", id: fGrade.id };
  }

  // No grade configuration can handle this score
  console.error(
    `No grade found for score ${numScore} and no F grade configured`
  );
  return { letter: null, id: null };
};

// Function to calculate batch GPA
export const calculateBatchGpa = async (data, req = {}) => {
  return await fetch(`${process.env.API_URL}/api/studentgpa/batch`, {
    method: "POST",
    credentials: "include",
    headers: {
      ...(req.headers && { cookie: req.headers.cookie }),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};
