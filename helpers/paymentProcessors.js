import CryptoJS from "crypto-js";
import { getNewTransactionAmount } from "./FetchWrapper";

const merchantId = "538757950",
  apiKey = "450683",
  serviceTypeId = "2270787069",
  testPublicKey =
    "QzAwMDAyMTUyNzl8NDMyODczODV8YjY2YTljMWJhZjA0MzgyNzE3M2Q0ZWI1MDM1ZmRmOTY4OGEwYmZkZGNiYjMyYTAxMzU4NmIxNjJkZWJhNWJjNTFhYTEyYzBiNTQ1Mjg1OTI3M2EyYzMzOTU0NDI2MDc5OTZhZjAzOTdkMTBkNWRmNjVjYjNlNWY0YmQ2ZTIwMTA=",
  livePublicKey =
    "QzAwMDAyMTUyNzl8NTgwNzYzMjU5NHw0ZjYzY2M2NjZiMDE5ZGM2Y2VmZWYzNTU0NDBkZTZlZjYwNmQ1NDYyZmU2NTM5NjVjNzVmNzcwZmYzYTlkMDkzNzdjNjIxZDQxYTY3NWU5NTYzYjdjMjlhMzE1MTQxNjk5ZmI0OTk0ZDE3ZGQ2NTgxYmIwNjZkZWY0NTk1NzU2Yw==";

export const processPaystack = (payData, user, paymentSuccessFxn, _, key) => {
  const koboAmount = Math.trunc(getNewTransactionAmount(payData.amount) * 100);

  // Check if PaystackPop is available
  if (typeof window === "undefined" || !window.PaystackPop) {
    console.error(
      "PaystackPop is not available. Please ensure the Paystack script is loaded."
    );
    throw new Error(
      "PaystackPop is not available. Please refresh the page and try again."
    );
  }

  const paystack = new window.PaystackPop();

  // Prepare cart metadata for better reconciliation
  const cartMetadata = {
    cart_items: JSON.stringify(payData.cart),
    total_amount: payData.amount,
    reference: payData.reference,
    processor: payData.processor,
  };

  paystack.newTransaction({
    email: user.email,
    amount: koboAmount,
    key,
    currency: "NGN",
    split_code: "SPL_T541Am18mo",
    ref: payData.reference,
    metadata: {
      custom_fields: [
        {
          display_name: "User id",
          variable_name: "user_id",
          value: user.id,
        },
        {
          display_name: "Username",
          variable_name: "username",
          value: user.username,
        },
        {
          display_name: "First Name",
          variable_name: "first_name",
          value: user.first_name,
        },
        {
          display_name: "Last name",
          variable_name: "last_name",
          value: user.last_name,
        },
        {
          display_name: "Cart Items",
          variable_name: "cart_items",
          value: JSON.stringify(payData.cart),
        },
        {
          display_name: "Total Amount",
          variable_name: "total_amount",
          value: payData.amount.toString(),
        },
      ],
      ...cartMetadata,
    },

    onSuccess: async (transaction) => {
      // Payment complete! Reference: transaction.reference
      await paymentSuccessFxn(payData);
    },
    onCancel: () => {
      // user closed popup
    },
  });
};

export const requestRemitaRRR = async (payData, user) => {
  const apiHash = await CryptoJS.SHA512(
    merchantId + serviceTypeId + payData.reference + payData.amount + apiKey
  );

  let RRR,
    split1 = ((payData.amount * 31) / 100).toFixed(2),
    split2 = (payData.amount - split1).toFixed(2);
  //console.log("unn: ", split1, "edu: ", split2);

  let RRRrequest = await fetch(
    `https://login.remita.net/remita/exapp/api/v1/send/api/echannelsvc/merchant/api/paymentinit`,
    // `https://remitademo.net/remita/exapp/api/v1/send/api/echannelsvc/merchant/api/paymentinit`, //Test
    {
      method: "post",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `remitaConsumerKey=${merchantId},remitaConsumerToken=${apiHash}`,
      },
      body: JSON.stringify({
        serviceTypeId,
        amount: payData.amount,
        orderId: payData.reference,
        payerName: `${user.first_name} ${user.last_name}`,
        payerEmail: user.email,
        description: "Student Payment",

        lineItems: [
          {
            lineItemsId: "UNNCDeL",
            beneficiaryName: "UNN Revenue Account (TSA)",
            beneficiaryAccount: "0060218261027",
            bankCode: "000",
            beneficiaryAmount: split1,
            deductFeeFrom: "1",
          },
          {
            lineItemsId: "EDUPlatforms",
            beneficiaryName: "EduPlatforms Limited",
            beneficiaryAccount: "1014758723",
            bankCode: "057",
            beneficiaryAmount: split2,
            deductFeeFrom: "0",
          },
        ],
        custom_fields: [
          {
            display_name: "User id",
            variable_name: "user_id",
            value: user.id,
          },
          {
            display_name: "Username",
            variable_name: "username",
            value: user.username,
          },
          {
            display_name: "First Name",
            variable_name: "first_name",
            value: user.first_name,
          },
          {
            display_name: "Last name",
            variable_name: "last_name",
            value: user.last_name,
          },
          {
            display_name: "Reference",
            variable_name: "reference",
            value: payData.reference,
          },
        ],
      }),
    }
  );

  const jsonText = await RRRrequest.text();

  // if (jsonText.startsWith("json")) jsonText = jsonText.split("(")[1].slice(0, -1)
  // RRR = JSON.parse(jsonText).RRR

  // console.log(jsonText);
  try {
    RRR = JSON.parse(jsonText.substr(7).slice(0, -1)).RRR;
  } catch (e) {
    console.log("Error generating RRR");
  }

  return RRR;
};

export const processRemita = (
  payData,
  user,
  rrr,
  paymentSuccessFxn,
  paymentFailureFxn
) => {
  payData.rrr = rrr;
  //console.log(payData);
  const paymentEngine = RmPaymentEngine.init({
    serviceTypeId: serviceTypeId,
    key: livePublicKey,
    customerId: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    narration: payData.reference,
    amount: payData.amount,
    processRrr: true,
    extendedData: {
      customFields: [
        {
          name: "rrr",
          value: rrr,
        },
      ],
    },

    onSuccess: function (response) {
      paymentSuccessFxn(payData);
    },
    onError: function (response) {
      paymentFailureFxn(payData);
    },
    onClose: function () {},
  });
  paymentEngine.showPaymentWidget();
};
