// External Dependancies
const boom = require("boom");
const checkAccess = require("../helpers/utils").checkAccess;

// Get Data Models
const Affiliate = require("../models/Affiliate");
const User = require("../models/User");
const Bookshelf = require("../config/connection").Bookshelf;

// Get all Affiliate
exports.getAffiliates = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "STUDENT",
    "AFFILIATE"
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    let query = Affiliate.forge();

    if (req.query) {
      for (var key in req.query) {
        if (typeof req.query[key] == "object") {
          query.where(key, "IN", req.query[key]);
        } else {
          query.where(key, req.query[key]);
        }
      }
    }

    const affiliate = await query.fetchAll({
      withRelated: ["user"]
    });

    return affiliate;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get a affiliate by ID
exports.getAffiliateById = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    //const car = await Car.where({ name: req.params.name }).fetch();  //this works too

    const affiliate = await new Affiliate({ id: id }).fetch();

    return affiliate;
  } catch (err) {
    throw boom.boomify(err);
  }
};

//Add a new affiliate
exports.addAffiliate = async (req, reply) => {
  const validatedUser = req.params && req.params.validatedUser;
  let user = {};

  try {
    const { referral_code, ...reqBody } = req.body;
    // console.log(referral_code, reqBody)
    if (referral_code && validatedUser) {
      user = await User.where("id", +reqBody.user_id).fetch();
      const userData = user.attributes;
      // console.log(user, user.user_id, validatedUser.id, user.user_id != validatedUser.id)
      if (userData) {
        if (userData.id != validatedUser.id) {
          throw "Improper access";
        }

        user.set({ username: referral_code });
        user = await user.save();
        if (user.attributes) user = user.attributes;
      }
    }

    if (!referral_code || user.username == referral_code) {
      const affiliate = Affiliate.forge(reqBody).save();
      return affiliate;
    } else throw "Error saving username";
  } catch (err) {
    throw err;
  }
};

// Update an existing affiliate
exports.updateAffiliate = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "STUDENT",
    "AFFILIATE"
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  const isHigherAccess = "ADMIN,SUPERADMIN".indexOf(validatedUser.role) > -1;

  try {
    const affiliate = await Affiliate.where("id", req.params.id).fetch({
      withRelated: ["user"]
    });
    const affiliateData = affiliate.attributes;
    // console.log(affiliate, affiliate.user_id, validatedUser.id, affiliate.user_id != validatedUser.id)
    if (affiliateData) {
      if (affiliateData.user_id != validatedUser.id && !isHigherAccess) {
        throw "Improper access";
      }

      affiliate.set(req.body);
      await affiliate.save();
    }

    return affiliate;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an affiliate by id
exports.deleteAffiliate = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    const affiliate = await new Affiliate({ id: id }).destroy();
    return affiliate;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.dashboard = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "STUDENT",
    "AFFILIATE"
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  const { username, user_id } = req.query;

  let referrals,
    finalData = {},
    referralIDs = [],
    bulkUserCart = {};

  referrals = await Bookshelf.knex("user")
    .join("student", "user.id", "=", "student.user_id")
    .join("payment2", "student.id", "=", "payment2.student_id")

    .where("user.referral_code", username)
    .select(
      "payment2.cart",
      "user.*",
      "student.status",
      "student.admitted",
      "student.reg_no"
    );

  let affiliate = await Affiliate.where({ user_id }).fetch();
  affiliate = affiliate.attributes;

  referrals.forEach(ref => {
    if (bulkUserCart[ref.id] !== undefined) {
      bulkUserCart[ref.id].cart = {
        ...bulkUserCart[ref.id].cart,
        ...ref.cart
      };
    } else {
      bulkUserCart[ref.id] = ref;
      referralIDs.push(ref.id);
    }
  });

  bulkUserCart = [...Object.values(bulkUserCart)];

  finalData = bulkUserCart.map((ref, i) => {
    // console.log(i === 0 && ref.relations.student.relations);
    // if referral's application has been completed but not yet granted
    if (
      ref.status === true &&
      ref.admitted === false &&
      ref.role !== "DECLINED APPLICANT"
    ) {
      ref.affiliate_info = {
        affiliate_status: "Awaiting Admission",
        amount_due: "0",
        paid: "N/A"
      };
    }
    // else if referral has completed application and has been granted admission
    else if (ref.status === true && ref.admitted === true) {
      const cartKeys = Object.keys(ref.cart);
      // check if application fee and acceptance fee has been paid

      const applicationFeeAndAcceptance =
        cartKeys.includes("1") && cartKeys.includes("2");
      // check if any of the tuition's have been paid

      const tuitionPaid = cartKeys.includes("12") || cartKeys.includes("3");

      // if application and acceptance fee has been paid but tuition has not yet been paid
      if (applicationFeeAndAcceptance && !tuitionPaid) {
        ref.affiliate_info = {
          affiliate_status: "Awaiting Tuition",
          amount_due: "0",
          paid: "N/A"
        };
      }
      // else if both application, acceptance fee and tuition has been paid
      else if (applicationFeeAndAcceptance && tuitionPaid) {
        if (affiliate.affiliate_paid.includes(ref.id)) {
          ref.affiliate_info = {
            affiliate_status: "Tuition Confirmed",
            amount_due: "0",
            paid: "YES"
          };
        } else {
          ref.affiliate_info = {
            affiliate_status: "Tuition Confirmed",
            amount_due: "10000.00",
            paid: "NO"
          };
        }
      }

      // else none of the fees have been paid
      else {
        ref.affiliate_info = {
          affiliate_status: "No Fees Paid Yet",
          amount_due: "0",
          paid: "N/A"
        };
      }
    }
    // else if the referrals application has been denied;
    else if (ref.role === "DECLINED APPLICANT") {
      ref.affiliate_info = {
        affiliate_status: "Admission Denied",
        amount_due: "0",
        paid: "N/A"
      };
    }

    return ref;
  });

  const referralsNotPaid = await Bookshelf.knex("user")
    .join("student", "user.id", "=", "student.user_id")
    .where(function() {
      this.whereNotIn("user.id", referralIDs).andWhere(
        "referral_code",
        username
      );
    })
    .select("student.status", "student.admitted", "user.*")
    .then(data => {
      data.forEach(ref => {
        if (
          ref.status === true &&
          ref.admitted === false &&
          ref.role !== "DECLINED APPLICANT"
        ) {
          ref.affiliate_info = {
            affiliate_status: "Awaiting Admission",
            amount_due: "0",
            paid: "N/A"
          };
        } else if (ref.role === "DECLINED APPLICANT") {
          ref.affiliate_info = {
            affiliate_status: "Admission Denied",
            amount_due: "0",
            paid: "N/A"
          };
        } else {
          ref.affiliate_info = {
            affiliate_status: "No Fees Paid Yet",
            amount_due: "0",
            paid: "N/A"
          };
        }
      });

      return data;
    });

  // finalData = Object.values(finalData);
  finalData = [...finalData, ...referralsNotPaid];
  return finalData;
};

exports.confirmPayment = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  const { affiliate_id, referral_id } = req.body;

  try {
    let affiliate = await Affiliate.where({ user_id: affiliate_id }).fetch();
    affiliate = affiliate.attributes;
    const refPaid = [...affiliate.affiliate_paid].concat(referral_id);
    console.log(refPaid, referral_id);

    const returnData = await Affiliate.forge()
      .where({ user_id: affiliate_id })
      .save({ affiliate_paid: refPaid }, { patch: true });

    return { success: true };
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.unconfirmPayment = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  const { affiliate_id, referral_id } = req.body;

  try {
    let affiliate = await Affiliate.where({ user_id: affiliate_id }).fetch();
    affiliate = affiliate.attributes;
    const removeRefPaid = [...affiliate.affiliate_paid].filter(
      ref => Number(ref) !== Number(referral_id)
    );

    const returnData = await Affiliate.forge()
      .where({ user_id: affiliate_id })
      .save({ affiliate_paid: removeRefPaid }, { patch: true });

    return { success: true };
  } catch (err) {
    throw boom.boomify(err);
  }
};
