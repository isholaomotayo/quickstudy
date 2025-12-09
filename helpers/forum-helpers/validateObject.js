export const validateObject = value => {
  const checkValue = Object.keys(value)[0] == undefined;

  return checkValue;
};
