import dayjs from "dayjs";
dayjs().format();
const formatDate = date => {
  if (typeof date !== "string") {
    return false;
  }
  const newDate = new Date(date.replace("T", " "));
  //   const formatedDate = `${newDate.getFullYear()}-${newDate.getMonth()}-${newDate.getDay()}`;
  const dob = dayjs(date);
  const dates = `${dob.$y}-${
    String(dob.$m).length == 1 ? `0${dob.$m}` : dob.$m
  }-${String(dob.$D).length == 1 ? `0${dob.$D}` : dob.$D}T${
    String(newDate.getHours()).length == 1
      ? `0${newDate.getHours()}`
      : newDate.getHours()
  }:${
    String(newDate.getMinutes()).length == 1
      ? `0${newDate.getMinutes()}`
      : newDate.getMinutes()
  }`;

  return dates;
};

const checkTopicDate = data => {
  const endDate = new Date(data.end_date).valueOf();
  const startDate = new Date(data.start_date).valueOf();
  const now = Date.now();
  if (startDate <= now && now <= endDate) {
    return true;
  } else {
    return false;
  }
};

const formatMonth = month => {
  if (month === null) {
    return;
  }
  const date = `${month}`;
  let finalDate;
  if (date.length == 1 && month < 9) {
    finalDate = `0${month + 1}`;
  } else {
    finalDate = `${month + 1}`;
  }
  return finalDate;
};

const dateFormater = date => {
  const month = formatMonth(date.getMonth());

  const dateFull = `${date.getFullYear()}-${month}-${
    String(date.getDate()).length == 1 ? `0${date.getDate()}` : date.getDate()
  }T${
    String(date.getHours()).length == 1
      ? `0${date.getHours()}`
      : date.getHours()
  }:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}Z`;

  return dateFull;
};

export { formatDate, checkTopicDate, dateFormater };
