const boom = require("boom");
const User = require("../models/User");
const Student = require("../models/Student");
const Institution = require("../models/Institution");
const bcrypt = require("bcryptjs");
const { checkAccess } = require("../helpers/utils");

const saltRounds = process.env.SALT_ROUNDS || 10;

// Get complete profile data (user, student, institution)
exports.getProfile = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "LECTURER",
    "STUDENT",
    "APPLICANT",
  ];

  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  try {
    const userId = req.params.id || validatedUser.id;

    // Ensure users can only access their own profile unless they have admin privileges
    const isHigherAccess =
      ["ADMIN", "SUPERADMIN", "HOD"].indexOf(validatedUser.role) > -1;
    if (userId != validatedUser.id && !isHigherAccess) {
      throw boom.forbidden("Access denied");
    }

    // Fetch user with ID from database

    // Get user data with relationships
    const user = await User.where({ id: userId }).fetch({
      withRelated: ["student", "staff", "affiliate"],
    });

    if (!user) {
      throw boom.notFound("User not found");
    }

    // User found, proceed with data collection

    let profileData = {
      user: user,
      student: null,
      staff: null,
      institution: null,
    };

    // Get student data if user is a student or has student relationship
    if (validatedUser.role === "STUDENT" || user.relations.student) {
      try {
        const student = await Student.where({ user_id: userId }).fetch({
          withRelated: ["programme.department.faculty", "semester"],
        });
        if (student) {
          // Get current active semester
          try {
            const Semester = require("../models/Semester");
            const currentSemester = await Semester.where({
              institution_id: user.get("institution_id"),
              is_active: true,
            })
              .orderBy("id", "desc")
              .fetch();

            if (currentSemester) {
              // Use .set() to add as model attribute for fast serialization
              student.set("current_semester", currentSemester);
            }
          } catch (err) {
            console.log("Error fetching current semester:", err);
          }

          // Get course counts
          try {
            const StudentCourse = require("../models/StudentCourse");

            // Count registered courses
            const registeredCoursesCount = await StudentCourse.where({
              student_id: student.get("id"),
            }).count();

            // Count approved courses (approval_status = true)
            const approvedCoursesCount = await StudentCourse.where({
              student_id: student.get("id"),
              approval_status: true,
            }).count();

            // Use .set() to add as model attributes for fast serialization
            student.set("registered_courses_count", registeredCoursesCount);
            student.set("approved_courses_count", approvedCoursesCount);
          } catch (err) {
            console.log("Error fetching course counts:", err);
            student.set("registered_courses_count", 0);
            student.set("approved_courses_count", 0);
          }

          profileData.student = student;
        }
      } catch (err) {
        console.log("Error fetching student data:", err);
        profileData.student = null;
      }
    }

    // Get staff data if user is staff/hod/lecturer
    if (
      ["STAFF", "HOD", "LECTURER"].includes(validatedUser.role) &&
      user.relations.staff
    ) {
      profileData.staff = user.relations.staff;
    }

    // Get institution data
    if (user.get("institution_id")) {
      try {
        const institution = await Institution.where({
          id: user.get("institution_id"),
        }).fetch();

        if (institution) {
          profileData.institution = institution;
        }
      } catch (err) {
        console.log("Error fetching institution data:", err);
        profileData.institution = null;
      }
    }

    return profileData;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update profile data (unified endpoint for user and student updates)
exports.updateProfile = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "LECTURER",
    "STUDENT",
    "APPLICANT",
  ];

  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  try {
    const userId = req.params.id || validatedUser.id;
    const updates = req.body;

    // Ensure users can only update their own profile unless they have admin privileges
    const isHigherAccess =
      ["ADMIN", "SUPERADMIN", "HOD"].indexOf(validatedUser.role) > -1;
    if (userId != validatedUser.id && !isHigherAccess) {
      throw boom.forbidden("Access denied");
    }

    // Track what was updated for response

    // Handle user profile updates
    if (updates.user) {
      const userFields = [
        "first_name",
        "last_name",
        "other_name",
        "phone",
        "avatar",
      ];

      const userUpdates = {};
      for (const field of userFields) {
        if (updates.user[field] !== undefined) {
          userUpdates[field] = updates.user[field];
        }
      }

      if (Object.keys(userUpdates).length > 0) {
        await User.forge({ id: userId }).save(userUpdates, {
          patch: true,
        });
      }
    }

    // Handle student profile updates
    if (
      updates.student &&
      (validatedUser.role === "STUDENT" || isHigherAccess)
    ) {
      const studentFields = [
        "address",
        "dob",
        "gender",
        "marital_status",
        "employment_status",
        "state_origin",
        "lga_origin",
        "state_residence",
        "lga_residence",
        "course_studied",
        "inst_name",
        "inst_type",
        "degree_grade",
        "type_degree",
        "grad_year",
      ];

      const studentUpdates = {};
      for (const field of studentFields) {
        if (updates.student[field] !== undefined) {
          studentUpdates[field] = updates.student[field];
        }
      }

      if (Object.keys(studentUpdates).length > 0) {
        // Get student record
        const student = await Student.where({ user_id: userId }).fetch();
        if (student) {
          await Student.forge({ id: student.id }).save(studentUpdates, {
            patch: true,
          });
        }
      }
    }

    // Handle password change
    if (updates.password) {
      const { currentPassword, newPassword, confirmPassword } =
        updates.password;

      if (!currentPassword || !newPassword || !confirmPassword) {
        throw boom.badRequest("All password fields are required");
      }

      if (newPassword !== confirmPassword) {
        throw boom.badRequest("New passwords do not match");
      }

      // Get current user to verify password
      const currentUser = await User.where({ id: userId }).fetch();
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        currentUser.get("password")
      );

      if (!isValidPassword) {
        throw boom.badRequest("Current password is incorrect");
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      await User.forge({ id: userId }).save(
        { password: hashedPassword },
        {
          patch: true,
        }
      );
    }

    // Return updated profile data
    const user = await User.where({ id: userId }).fetch({
      withRelated: ["student", "staff", "affiliate"],
    });

    let profileData = {
      user: user,
      student: null,
      staff: null,
      institution: null,
      message: "Profile updated successfully",
    };

    // Get updated student data if available
    if (user.relations.student) {
      const student = await Student.where({ user_id: userId }).fetch({
        withRelated: ["programme", "semester", "fees"],
      });

      if (student) {
        profileData.student = student;
      }
    }

    // Get staff data if available
    if (user.relations.staff) {
      profileData.staff = user.relations.staff;
    }

    // Get institution data
    if (user.get("institution_id")) {
      const institution = await Institution.where({
        id: user.get("institution_id"),
      }).fetch();

      if (institution) {
        const institutionData = institution;
        // Ensure id_card field is included
        if (
          institutionData.id_card &&
          typeof institutionData.id_card === "string"
        ) {
          try {
            institutionData.id_card = JSON.parse(institutionData.id_card);
          } catch (parseError) {
            console.log("Error parsing id_card JSON:", parseError);
            institutionData.id_card = null;
          }
        }
        profileData.institution = institutionData;
      }
    }

    return profileData;
  } catch (err) {
    throw boom.boomify(err);
  }
};
