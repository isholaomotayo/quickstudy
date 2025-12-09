const boom = require("boom");
const PaymentAccount = require("../models/PaymentAccount");

const checkAccess = require("../helpers/utils").checkAccess;

const cryptText = require("../helpers/utils").cryptText;
const serverEnv = process.env.SERVER_ENV;

// Get all Payments made
exports.list = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const paymentAccounts = await PaymentAccount.fetchAll({
      withRelated: ["institution"]
    });

    paymentAccounts.forEach((account, i) => {
      delete account.attributes.secret_key;
      delete account.attributes.test_secret_key;
    });

    return paymentAccounts.models;
  } catch (err) {
    throw boom.boomify(err);
  }
};


exports.get = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  if(validatedUser.role == "SUPERADMIN") return null;

  try {
    const paymentAccount = await PaymentAccount.where({
      institution_id: +validatedUser.institution_id
    }).fetch({
      columns: [
        'id', 'institution_id', 'merchant_id', 'terminal_id', 'public_key', 'test_public_key'
      ]
    });

    if (paymentAccount && paymentAccount.attributes) {
      if (serverEnv && "testing,local,staging".indexOf(serverEnv) > -1) {
        paymentAccount.attributes.public_key = paymentAccount.attributes.test_public_key
        delete paymentAccount.attributes.test_public_key
      }
    }

    return paymentAccount;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.add = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    const params = req.body;
    params.sk = cryptText(req.body.sk, "encrypt");
    params.tsk = cryptText(req.body.tsk, "encrypt");

    params.secret_key = params.sk;
    params.test_secret_key = params.tsk;
    params.public_key = params.pk;
    params.test_public_key = params.tpk;

    delete params.sk;
    delete params.tsk;
    delete params.pk;
    delete params.tpk;

    const payment = await PaymentAccount.forge(params).save();

    return payment;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.update = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    if (req.body.hasOwnProperty("sk")) {
      req.body.sk = cryptText(req.body.sk, "encrypt");
      req.body.secret_key = req.body.sk;

      delete req.body.sk;
    }
    if (req.body.hasOwnProperty("tsk")) {
      req.body.tsk = cryptText(req.body.tsk, "encrypt");
      req.body.test_secret_key = req.body.tsk;

      delete req.body.tsk;
    }

    req.body.public_key = req.body.pk;
    req.body.test_public_key = req.body.tpk;

    delete req.body.pk;
    delete req.body.tpk;

    const paymentAccount = await PaymentAccount.where(
      "id",
      req.params.id
    ).fetch();
    if (paymentAccount) {
      paymentAccount.set(req.body);
      await paymentAccount.save();
    }

    return paymentAccount;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.delete = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    const paymentAccount = await new PaymentAccount({ id: id }).destroy();
    return paymentAccount;
  } catch (err) {
    throw boom.boomify(err);
  }
};
