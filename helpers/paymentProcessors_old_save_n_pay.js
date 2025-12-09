export const processPaystack = (payment, user, paymentSuccessFxn, key) => {
  // Do custom paystack calculations
  const koboAmount = Math.trunc(payment.amount * 100);

  const handler = PaystackPop.setup({
    email: user.email,
    amount: koboAmount,
    key,
    currency: "NGN",
    ref: payment.reference,
    metadata: {
      custom_fields: [
        {
          display_name: "Payment id",
          variable_name: "payment_id",
          value: payment.id
        },
        {
          display_name: "User id",
          variable_name: "user_id",
          value: user.id
        },
        {
          display_name: "Name",
          variable_name: "name",
          value: `${user.first_name} ${user.last_name}`
        },
        {
          display_name: "Username",
          variable_name: "username",
          value: user.username
        }
      ]
    },
    callback: response => {
      paymentSuccessFxn();
    },
    onClose: () => {}
  });
  handler.openIframe();
};

export const processRemita = (
  payment,
  user,
  paymentSuccessFxn,
  paymentFailureFxn
) => {
  var paymentEngine = RmPaymentEngine.init({
    key: `1946`,
    customerId: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    narration: payment.reference,
    amount: payment.amount,
    onSuccess: function(response) {
      paymentSuccessFxn();
    },
    onError: function(response) {
      paymentFailureFxn();
    },
    onClose: function() {}
  });
  paymentEngine.showPaymentWidget();
};
