const FeeStudentPayment = require("../models/FeeStudentPayment");
const FeeStudentPaymentFrequency = require("../models/FeeStudentPaymentFrequency");
const FeeStudent = require("../models/FeeStudent");
const Student = require("../models/Student");
const { sgMail } = require("../services/emailService");
require("dotenv").config();
var crypto = require("crypto");

const boom = require("boom");
exports.paystackWebHook = async (req, reply) => {
  //handle paystack webhooks for payments

  var secret = process.env.PAYSTACK_SECRET_KEY;
  var hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");
  if (hash == req.headers["x-paystack-signature"]) {
    // Retrieve the request's body

    if (req.body) {
      const {
        ip_address,
        currency,
        channel,
        created_at,
        paid_at,
        gateway_response,
        message,
        amount,
        reference,
        status,
      } = req.body.data;

      // Do something with event
      const payment = await FeeStudentPayment.forge()
        .where({
          transaction_id: reference,
        })
        .save(
          {
            transaction_datetime: paid_at,
            transaction_amount: amount,
            transaction_ref: reference,
            transaction_status: status,
          },
          {
            patch: true,
          }
        )
        .then(async (payment) => {
          await FeeStudentPaymentFrequency.forge({
            id: payment.attributes.fee_student_payment_frequency_id,
          })
            .fetch({
              withRelated: ["feestudent"],
            })
            .then(async (paymentUpdate) => {
              paymentUpdate
                .save(
                  {
                    status: 1,
                  },
                  {
                    patch: true,
                  }
                )

                .then(async (feestudentpaymentfreq) => {
                  let studentId = feestudentpaymentfreq.attributes.student_id;

                  let feeId =
                    feestudentpaymentfreq.relations.feestudent.attributes
                      .fee_id;
                  //uPdate fee student record if payment plan is 'PAY IN FULL'
                  if (
                    feestudentpaymentfreq.attributes.payment_plan ===
                    "PAY IN FULL"
                  ) {
                    const feeStudentUpdate = await FeeStudent.forge()
                      .where({
                        id: feestudentpaymentfreq.attributes.fee_student_id,
                      })
                      .save(
                        {
                          paid_fees: 1,
                        },
                        {
                          patch: true,
                        }
                      );
                  }

                  //Generate reg no and update student profile if fee paid is Acceptance Fee

                  if (feeId == 2 || feeId == 13) {
                    //Acceptance fee id
                    generateStudentRegNo(studentId); //generate matric no
                  }
                });
            });
        });

      reply.code(200);
      reply.send(status);
    }
  } else {
    reply.code(401);
    reply.send({ error: "payment" });
  }
};
async function generateStudentRegNo(studentId) {
  return Student.where({ id: studentId })
    .query({
      where: { reg_no: null },
      orWhere: { reg_no: "" },
    }) // check that student doesn't already have a reg no
    .fetch()
    .then(async (studentRecord) => {
      let existingId,
        res,
        highestId = 0o0,
        lastStudent,
        newRegNo,
        nextSession;

      //get students in the same session_admited
      await Student.forge()
        .where("reg_no", "is not", null)
        .where("reg_no", "!=", "")
        .where({
          session_admitted_id: studentRecord.attributes.session_admitted_id,
        })
        .fetchAll()
        .then(async (students) => {
          // students in the same session_admited exist
          //get the highest and only increment the number
          if (students.length) {
            students.map((student) => {
              existingId = student.attributes.reg_no;

              res = existingId.split("/");
              regId = res[4];

              if (regId > highestId) {
                highestId = regId;
                lastStudent = student;
                nextId = parseInt(highestId) + 1;
                newRegNo =
                  res[0] +
                  "/" +
                  res[1] +
                  "/" +
                  res[2] +
                  "/" +
                  res[3] +
                  "/" +
                  nextId;
              }
            });
          } else {
            // students in the same session_admited do not exist
            // next: get the highest in the last set, increment the number
            // and generate a new format using the session admitted

            // this works. just not needed for now. The institution wants to start generation from a number
            // separate from the last number in the db

            // const prevStudents = await Student.forge()
            //   .where('reg_no', 'is not', null)
            //   .fetchAll();

            // if (prevStudents.length) {
            //   prevStudents.map(student => {
            //     existingId = student.attributes.reg_no;

            //     res = existingId.split('/');
            //     regId = res[4];

            //     if (parseInt(regId) > parseInt(highestId)) {
            //       highestId = regId;
            //       nextId = parseInt(highestId) + 1;
            //       nextSession = parseInt(res[3]) + 1;

            //       newRegNo =
            //         res[0] +
            //         '/' +
            //         res[1] +
            //         '/' +
            //         res[2] +
            //         '/' +
            //         nextSession +
            //         '/' +
            //         nextId;
            //     }
            //   });
            // }

            newRegNo = "PG/MBA/DL/20/468";
          }
        })
        .catch(async (error) => {
          if ((error.message = "EmptyResponse")) {
            newRegNo = "PG/MBA/DL/20/468";
          }
        });

      Student.forge()
        .where({ id: studentRecord.attributes.id })
        .save({ reg_no: newRegNo }, { patch: true });
    })
    .catch(async (error) => {
      if ((error.message = "EmptyResponse")) {
        // Make error message more descriptive
        err = boom.unauthorized(
          "Matric Num generation failed. Student reg no is not empty"
        );
        throw err;
      }
      throw boom.boomify(error);
    });
}
