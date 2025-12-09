const FeeStudentPaymentFrequency = require("../models/FeeStudentPaymentFrequency");
const FeeStudent = require("../models/FeeStudent");
const Bookshelf = require("../config/connection").Bookshelf;
const checkAccess = require("../helpers/utils").checkAccess;
const boom = require("boom");

exports.paymentPlanChange = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  let bulkResult = [];
  try {
    const feeId = req.body.id;
    const studentId = req.body.student_id;
    const changedPlan = req.body.changed_plan;

    const studentFee = await new FeeStudent({
      student_id: Number(studentId),
      id: Number(feeId)
    }).fetch({
      withRelated: ["student", "semester"]
    });
    console.log(studentFee);
    let studentFeeFreq,
      paidFees = [],
      unpaidFees = [],
      amountPaid = 0,
      amountRemaining,
      amountToPay,
      paymentTimes,
      dataToCreate = [],
      data = {},
      deleteId = [],
      sure = [];

    const {
      fee_id,
      total_amount,
      paid_fees,
      payment_plan,
      student_id,
      id
    } = studentFee.attributes;

    studentFeeFreq = await FeeStudentPaymentFrequency.where({
      fee_student_id: Number(id)
    })
      .fetchAll()
      .then(result => {
        result.forEach(val => {
          val.attributes.status === 1
            ? (paidFees = paidFees.concat(val))
            : (unpaidFees = unpaidFees.concat(val));
        });
        return result.models;
      });

    paidFees.forEach(data => {
      amountPaid = amountPaid + Number(data.attributes.payment_amount);
    });

    amountRemaining = Number(total_amount) - amountPaid;

    if (fee_id === 12 || total_amount === "103500.00") {
      if (changedPlan === "MONTHLY") {
        amountToPay = amountRemaining / 5;
        paymentTimes = 5;
      }
      if (changedPlan === "PAY IN FULL") {
        amountToPay = amountRemaining;
        paymentTimes = 1;
      }
      if (changedPlan === "PER SEMESTER") {
        amountToPay = amountRemaining;
        paymentTimes = 1;
      }
      if (changedPlan === "PER SESSION") {
        amountToPay = amountRemaining;
        paymentTimes = 1;
      }
    } else if (fee_id === 3 || total_amount === "412200.00") {
      if (changedPlan === "MONTHLY") {
        amountToPay = amountRemaining / (18 - paidFees.length);
        paymentTimes = 18 - paidFees.length;
      }
      if (changedPlan === "PAY IN FULL") {
        amountToPay = amountRemaining;
        paymentTimes = 1;
      }
      if (changedPlan === "PER SESSION") {
        amountToPay = amountRemaining / 2;
        paymentTimes = 2;
      }

      if (changedPlan === "PER SEMESTER") {
        amountToPay = amountRemaining / 4;
        paymentTimes = 4;
      }
    }

    unpaidFees.forEach(data => {
      deleteId.push(+data.id);
    });

    amountToPay = amountToPay.toFixed(2);

    data = {
      student_id,
      fee_student_id: id,
      payment_plan: changedPlan,
      payment_amount: amountToPay,
      total_amount
    };

    for (let i = 0; i < paymentTimes; i++) {
      dataToCreate.push(data);
    }

    await Bookshelf.transaction(async trx => {
      await new FeeStudentPaymentFrequency()
        .query(function(qb) {
          return qb.whereIn("id", deleteId);
        })
        .save(
          { payment_plan: "CHANGED PLAN" },
          {
            method: "update",
            transacting: trx
          }
        )
        .then(async function(val) {
          return await FeeStudentPaymentFrequency.collection(
            dataToCreate
          ).invokeThen("save");
        })
        .then(function(result) {
          bulkResult = FeeStudentPaymentFrequency.where({
            student_id
          }).fetchAll({
            withRelated: ["student", "feestudent"]
          });
          return bulkResult;
        });
    });
  } catch (e) {
    throw boom.boomify(e);
  }

  return bulkResult;
};
