import Router from "next/router";
import fetch from "isomorphic-unfetch";
import { getCookies, setCookies } from "cookies-next";
import toast from "react-hot-toast";
import crypto from "crypto";

export const getRequestOrigin = (req) => {
  const host = req ? req.headers.host : window.location.host;
  const protocol = host.indexOf("localhost") > -1 ? "http" : "https";

  return `${protocol}://${host}`;
};
// Redeployment comment

export const showToastAlert = (
  message,
  colorClass = "success",
  timeOutSecs = 4000
) => {
  const options = {
    duration: timeOutSecs,
    position: "top-center",
  };

  switch (colorClass) {
    case "success":
      toast.success(message, options);
      break;
    case "error":
      toast.error(message, options);
      break;
    case "warning":
      toast(message, { ...options, icon: "⚠️" });
      break;
    default:
      toast(message, options);
  }
};

export const checkAndShowIfError = (error) => {
  if (error && error.message) {
    let notifMessage = error.message;

    if (error.statusCode == 402) {
      notifMessage += ": Please pay your fees to view the content";
    }

    toast.error(notifMessage, {
      position: "top-center",
      duration: 6000,
    });
  }
};

export const bounceToPage = async (url, res) => {
  try {
    if (res) {
      res.writeHead(302, {
        Location: url,
      });
      res.end();
    } else {
      Router.push(url);
    }
  } catch (e) {
    console.log(e);
  }
};

export const protectPage = (
  req,
  res,
  allowedRoles = [],
  bounceTo = "/login"
) => {
  /* Bounces unauthorized users from a page 
    or returns token assets for authorized users. 
    */
  let {
    token = "",
    role = "",
    userId = 0,
    userData = "{}",
  } = getCookies({ req }) || {};
  userData = JSON.parse(decodeURIComponent(userData));

  if (!role || allowedRoles.indexOf(role) < 0) {
    bounceToPage(bounceTo, res);
    // throw "Unauthorized"; // Last defense - incase bounce fails
  }

  return { token, role, userId, userData };
};

export const setAffiliateCookies = (username, ctx = null) => {
  const cookieExpiry = 1000 * 60 * 60 * 24 * 90;
  setCookies({ res: ctx }, "referrerCode", username, {
    path: "/",
    expires: cookieExpiry,
  });
};

export const codeLogin = async (
  req,
  res,
  query,
  pathname,
  failBounceTo = "/login"
) => {
  /* Emergency login, valid for a user's first payment only
   */
  let { userData } = getCookies({ req }) || {};
  if (userData) return; // Already logged in - do nothing

  if (!(query && query.code)) bounceToPage(failBounceTo, res);

  const svrResponse = await fetch(`${process.env.API_URL}/api/codelogin`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: query.code,
    }),
  });
  if (svrResponse.status === 200) {
    const user = await svrResponse.json();
    if (!(user && user.email)) bounceToPage(failBounceTo, res);

    // Set auth cookies with signatures (same as /api/login route)
    const cookieExpiry = 1000 * 60 * 60 * 24 * 365;
    const AUTH_SECRET = process.env.JWTSECRET || "fallback-secret-key";

    // Create userData cookie value
    const userDataValue = JSON.stringify({
      id: user.id,
      institution_id: user.institution_id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || "",
      student_id: (user.student && user.student.id) || "",
      fee_plan: (user.student && user.student.fee_plan) || "",
      staff_id: (user.staff && user.staff.id) || "",
    });

    // Create signatures
    const userSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(userDataValue)
      .digest("hex");

    const roleSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(user.role)
      .digest("hex");

    // Set cookies with signatures
    const ctx = { res };
    setCookies(ctx, "userData", userDataValue, { path: "/", expires: cookieExpiry });
    setCookies(ctx, "userSignature", userSignature, { path: "/", expires: cookieExpiry });
    setCookies(ctx, "role", user.role, { path: "/", expires: cookieExpiry });
    setCookies(ctx, "roleSignature", roleSignature, { path: "/", expires: cookieExpiry });
    setCookies(ctx, "userId", user.id, { path: "/", expires: cookieExpiry });
    setCookies(ctx, "token", user.token, { path: "/", expires: cookieExpiry });
    setCookies(ctx, "institutionId", user.institution_id, { path: "/", expires: cookieExpiry });

    bounceToPage(pathname, res);
  }

  bounceToPage(failBounceTo, res);
};

export const sortObjectsByStringProperty = (objectList, sortProperty) => {
  return objectList.sort(function (a, b) {
    if (a[sortProperty] < b[sortProperty]) {
      return -1;
    }
    if (a[sortProperty] > b[sortProperty]) {
      return 1;
    }
    return 0;
  });
};

export const sortObjectsByNumProperty = (objectList, sortProperty) => {
  return objectList.sort(function (a, b) {
    return a[sortProperty] - b[sortProperty];
  });
};

export const groupObjectsByProperty = (
  objectList,
  groupProperty,
  nestProperty = null
) => {
  const groupedList = {};

  objectList.forEach((item) => {
    let key = nestProperty
      ? item[nestProperty][groupProperty]
      : item[groupProperty];
    if (!(key in groupedList)) groupedList[key] = [];
    groupedList[key].push(item);
  });

  return groupedList;
};

export const getFieldTypeFromValue = (fieldValue) => {
  let fieldType = "text";
  const dateRegex = /^\d{4}[./-]\d{2}[./-]\d{2}$/;
  const dataType = typeof fieldValue;

  //fieldValue && dataType == "string" && console.log('>>>>', fieldValue, fieldValue.length > 9, fieldValue.slice(0, 10).match(dateRegex))
  if (
    dataType == "string" &&
    fieldValue.length > 9 &&
    fieldValue.slice(0, 10).match(dateRegex)
  ) {
    fieldType = fieldValue.indexOf("T") == 10 ? "datetime-local" : "date";
  } else if (dataType == "number" || dataType == "bigint") fieldType = "number";

  return fieldType;
};

export const getTableSchema = async (tableName, dataStateSetter) => {
  let schema = {};

  const svrResponse = await fetch(
    `${process.env.API_URL}/api/schema/${tableName}`
  );
  if (svrResponse.status === 200) {
    schema = await svrResponse.json();
    if (schema && dataStateSetter) dataStateSetter(schema);
  }
  //console.log('xxxxxxxxx>', tableName, schema)
  return schema;
};

export const checkDataRowExists = async (
  dbTable,
  filterCol,
  query = {},
  req = {}
) => {
  const filterVal = filterCol && filterCol in query && query[filterCol];
  const relatedCheck = query && query.checkRelated;

  if (!filterVal) return false;

  let dataURL = `${process.env.API_URL}/api/${dbTable.replace(
    "_",
    ""
  )}/check/${filterCol}/${filterVal}`;

  if (relatedCheck) dataURL = `${dataURL}?checkRelated=${relatedCheck}`;

  const dataRes = await fetch(dataURL, {
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {},
  });

  const data = await dataRes.json();
  let error = null;

  if (data && data.error) {
    error = { ...data };
    dataRows = [];
  }

  return [data, error];
};

export const getTableData = async (
  dbTable,
  filterCol = "",
  query = {},
  lineage = [],
  viaRelated = true,
  req = {}
) => {
  let dataURL = `${process.env.API_URL}/api/${dbTable.replace("_", "")}`,
    dataRows = [],
    childrenField = "";

  if (lineage.length) {
    lineage = lineage.map((step) => pluralize(step));
  }

  if (filterCol && filterCol in query) {
    if (filterCol.slice(-3) == "_id" && viaRelated) {
      let endPath = filterCol.substr(0, filterCol.length - 3).replace("_", ""),
        queryString = lineage.length
          ? `?relatedString=${lineage.join(".")}`
          : "";

      childrenField = pluralize(dbTable);
      dataURL = `${process.env.API_URL}/api/${endPath}/${query[filterCol]}${queryString}`;
    } else {
      viaRelated = false;
      dataURL = `${dataURL}?filter=${filterCol}:${query[filterCol]}`;
    }
  } else if (Object.keys(query).length) {
    const queryStrings = Object.entries(query)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    dataURL = `${dataURL}?${queryStrings}`;
    viaRelated = false;
  } else viaRelated = false;

  const dataRes = await fetch(dataURL, {
    credentials: "include",
    headers:
      req && req.headers && req.headers.cookie
        ? { cookie: req.headers.cookie }
        : {},
  });

  const pagination = dataRes &&
    dataRes.headers &&
    dataRes.headers.get("x-pagination-page") && {
      page: +dataRes.headers.get("x-pagination-page"),
      pageSize: +dataRes.headers.get("x-pagination-pagesize"),
      rowCount: +dataRes.headers.get("x-pagination-rowcount"),
      pageCount: +dataRes.headers.get("x-pagination-pagecount"),
    };

  const data = await dataRes.json();
  let error = {};
  let responsePagination = null;

  if (viaRelated) {
    dataRows = data[childrenField];

    if (lineage.length && false) {
      // TODO: If there's a need to get all children into 1 list
    }
  } else {
    // Handle new payment2 API response structure specifically
    if (
      dbTable === "payment2" &&
      data &&
      data.payments &&
      Array.isArray(data.payments)
    ) {
      dataRows = data.payments;
      // Use pagination from response if available
      if (data.pagination) {
        responsePagination = data.pagination;
      }
    } else {
      dataRows = data;
    }
  }

  if (dataRows && dataRows.error) {
    error = { ...dataRows };
    dataRows = [];
  } else if (data && data.error) {
    error = { ...data };
    dataRows = [];
  }

  if (
    dataRows &&
    dataRows.length &&
    dataRows[0].order &&
    typeof dataRows[0].order == "number"
  ) {
    dataRows = sortObjectsByNumProperty(dataRows, "order");
  }

  //console.log(dataURL, filterCol, viaRelated, dataRows)
  const returnValues = viaRelated
    ? [dataRows, data, error]
    : [dataRows, {}, error];

  // Use response pagination if available (from new payment2 API), otherwise use header pagination
  const finalPagination = responsePagination || pagination;
  if (finalPagination && finalPagination.page)
    returnValues.push(finalPagination);
  //console.log(3333333, data, error, dataRows, returnValues)
  return returnValues;
};

export const getTableDataAndSchema = async (
  dbTable,
  filterCol = "",
  query = {},
  lineage = []
) => {
  let dataURL = `${process.env.API_URL}/api/${dbTable.replace("_", "")}`,
    dataRows = [],
    viaRelated = false,
    childrenField = "";

  if (lineage.length) {
    lineage = lineage.map((step) => pluralize(step));
  }

  if (filterCol && filterCol in query) {
    if (filterCol.slice(-3) == "_id") {
      let endPath = filterCol.substr(0, filterCol.length - 3).replace("_", ""),
        queryString = lineage.length
          ? `?relatedString=${lineage.join(".")}`
          : "";

      childrenField = pluralize(dbTable);
      dataURL = `${process.env.API_URL}/api/${endPath}/${query[filterCol]}${queryString}`;
      viaRelated = true;
    } else {
      dataURL = `${dataURL}?filter=${filterCol}:${query[filterCol]}`;
    }
  }
  const dataRes = await fetch(dataURL);
  const data = await dataRes.json();

  const schemaRes = await fetch(`${API_HOST}/api/schema/${dbTable}`);
  const schema = await schemaRes.json();

  if (viaRelated && lineage.length) {
    // TODO: If need arises xxx
  } else if (viaRelated) {
    dataRows = data[childrenField];
  } else dataRows = data;

  //console.log(dataURL, filterCol, childrenField, query, data, viaRelated, dataRows)
  return viaRelated ? [dataRows, schema, data] : [dataRows, schema];
};

export const deleteTableRow = async (dbTable, rowID) => {
  const endpoint = `${process.env.API_URL}/api/${dbTable.replace(
    "_",
    ""
  )}/${+rowID}`;

  const dataRes = await fetch(endpoint, {
    method: "delete",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({}),
  });
  const data = await dataRes.json();

  if (data && data.error && data.message) {
    if (data.message.indexOf("foreign key constraint") > -1) {
      const childTable = data.message.split('"').slice(-2)[0].replace("_", " ");
      data.message = `Please delete all ${childTable.toUpperCase()} items under this item, first`;
    }
  }

  return data;
};

// export const jsonFromFormFields = (formData, jsonFieldName) => {
//     const fieldData = {}

//     Object.entries(formData).forEach(([fieldName, fieldValue]) => {
//         if (fieldName.indexOf(`${jsonFieldName}__`) !== 0) return

//         let [fieldGroupName, key, ...subField] = fieldName.split('__')
//         if (!(key in fieldData)) fieldData[key] = {}

//         let subFieldName = subField[0]
//         if (!(subFieldName in fieldData[key])) fieldData[key][subFieldName] = fieldValue

//         if (subField[1]) {
//             fieldData[key][subFieldName][subField[1]] = fieldValue
//         }

//         delete postData[fieldName]
//     })

//     postData[jsonFieldName] = fieldData

//     return postData
// }

export function setTableRow(stateRows, setStateRows, isDelete, delItemID) {
  //console.log(newRowData, isNewRow, stateRows, setStateRows)
  return (newRowData, isNewRow) => {
    const orderize =
      newRowData && newRowData.order && typeof newRowData.order == "number";
    let stateRows2 = [];

    if (isNewRow) {
      // Append the new row
      stateRows2 = [newRowData, ...stateRows];
    } else if (isDelete) {
      // Remove row from UI list
      stateRows2 = stateRows.filter((stateRow) => {
        return stateRow.id != delItemID;
      });
    } else {
      // Update the row with given ID
      stateRows2 = stateRows.map((stateRow) => {
        return stateRow.id == newRowData.id ? newRowData : stateRow;
      });
    }

    if (orderize) {
      stateRows2 = sortObjectsByNumProperty(stateRows2, "order");
    }

    setStateRows([...stateRows2]);
  };
}

export function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function ucfirst(str) {
  return str && str[0].toUpperCase() + str.slice(1);
}

export function userNameValid(username) {
  return /^[a-z0-9]+$/.test(username);
}

export function monthlyDates(startDate, endDate, asString = false) {
  let [startYear, startMonth, day] = startDate.split("-");
  let [endYear, endMonth] = endDate.split("-");
  const dates = [];

  for (let year = startYear; year <= endYear; year++) {
    let currStartMonth = year === startYear ? +startMonth - 1 : 0;
    let currEndMonth = year === endYear ? +endMonth - 1 : 11;
    day = +day;
    day = Math.min(day, 28);

    for (
      let j = currStartMonth;
      j <= currEndMonth;
      j = j > 12 ? j % 12 || 11 : j + 1
    ) {
      let month = j + 1;
      let displayMonth = month < 10 ? `0${month}` : month;
      let displayDay = day < 10 ? `0${day}` : day;
      const dateString = `${year}-${displayMonth}-${displayDay}`;

      if (asString) {
        dates.push(dateString);
      } else {
        let dateObj = new Date(dateString);
        dates.push(dateObj);
      }
    }
  }

  return dates;
}

export function pluralize(word, amount) {
  if (amount !== undefined && amount === 1) {
    return word;
  }
  const plural = {
    "(quiz)$": "$1zes",
    "^(ox)$": "$1en",
    "([m|l])ouse$": "$1ice",
    "(matr|vert|ind)ix|ex$": "$1ices",
    "(x|ch|ss|sh)$": "$1es",
    "([^aeiouy]|qu)y$": "$1ies",
    "(hive)$": "$1s",
    "(?:([^f])fe|([lr])f)$": "$1$2ves",
    "(shea|lea|loa|thie)f$": "$1ves",
    sis$: "ses",
    "([ti])um$": "$1a",
    "(tomat|potat|ech|her|vet)o$": "$1oes",
    "(bu)s$": "$1ses",
    "(alias)$": "$1es",
    "(octop)us$": "$1i",
    "(ax|test)is$": "$1es",
    "(us)$": "$1es",
    "([^s]+)$": "$1s",
  };
  const irregular = {
    move: "moves",
    foot: "feet",
    goose: "geese",
    sex: "sexes",
    child: "children",
    man: "men",
    tooth: "teeth",
    person: "people",
  };
  const uncountable = [
    "sheep",
    "fish",
    "deer",
    "moose",
    "series",
    "species",
    "money",
    "rice",
    "information",
    "equipment",
    "bison",
    "cod",
    "offspring",
    "pike",
    "salmon",
    "shrimp",
    "swine",
    "trout",
    "aircraft",
    "hovercraft",
    "spacecraft",
    "sugar",
    "tuna",
    "you",
    "wood",
  ];
  // save some time in the case that singular and plural are the same
  if (uncountable.indexOf(word.toLowerCase()) >= 0) {
    return word;
  }
  // check for irregular forms
  for (const w in irregular) {
    const pattern = new RegExp(`${w}$`, "i");
    const replace = irregular[w];
    if (pattern.test(word)) {
      return word.replace(pattern, replace);
    }
  }
  // check for matches using regular expressions
  for (const reg in plural) {
    const pattern = new RegExp(reg, "i");
    if (pattern.test(word)) {
      return word.replace(pattern, plural[reg]);
    }
  }
  return word;
}

export const quizOptionsFormat = {
  A: {
    text: "",
    is_answer: false,
  },
  B: {
    text: "",
    is_answer: false,
  },
  C: {
    text: "",
    is_answer: false,
  },
  D: {
    text: "",
    is_answer: false,
  },
  E: {
    text: "",
    is_answer: false,
  },
};

export const monthName = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};

export const readFileObject = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file, "utf-8");
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export const getDataPoints = async (dates = {}, req = false) => {
  let dataReport;
  let urlExt = "";
  if (Object.entries(dates).length === 2) {
    urlExt = `?startDate=${dates.startDate}&endDate=${dates.endDate}`;
  }
  try {
    dataReport = await fetch(
      `${process.env.API_URL}/api/report/weekly${urlExt}`,
      {
        method: "get",
        credentials: "include",
        headers: req
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
      }
    );

    dataReport = dataReport.status === 200 ? await dataReport.json() : [];

    return dataReport;
  } catch (e) {
    console.log(e);
  }
};

export const getAffiliateReferrals = async (query, req = false) => {
  let data;
  try {
    data = await fetch(
      `${process.env.API_URL}/api/affiliate/dashboard?username=${query.username}&user_id=${query.id}`,
      {
        method: "get",
        credentials: "include",
        headers: req
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
      }
    );
    data = data.status === 200 ? await data.json() : [];
  } catch (e) {
    console.log(e);
  }

  return data;
};

export const confirmPayment = async (query, req = false) => {
  let data;
  try {
    data = await fetch(`${process.env.API_URL}/api/affiliate/confirmpayment`, {
      method: "put",
      credentials: "include",
      headers: req
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
      body: JSON.stringify({
        ...query,
      }),
    });

    data = data.status === 200 ? await data.json() : false;
  } catch (e) {
    console.log(e);
    return false;
  }
  return data;
};

export const unconfirmPayment = async (query, req = false) => {
  let data;
  try {
    data = await fetch(
      `${process.env.API_URL}/api/affiliate/unconfirmpayment`,
      {
        method: "put",
        credentials: "include",
        headers: req
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
        body: JSON.stringify({
          ...query,
        }),
      }
    );

    data = data.status === 200 ? await data.json() : false;
  } catch (e) {
    console.log(e);
    return false;
  }
  return data;
};
