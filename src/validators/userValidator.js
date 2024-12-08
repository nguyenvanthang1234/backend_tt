const validateUserCreate = (data) => {
  const { email, password, confirmPassword } = data;
  const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  const isCheckEmail = reg.test(email);
  const errors = {};

  if (!email || !password || !confirmPassword) {
    errors.required = "the input is required";
  } else if (email && !isCheckEmail) {
    errors.email = "the input is email";
  } else if (password && confirmPassword && password !== confirmPassword) {
    errors.passwordMatch = "the password is not equal to confirmPassword";
  }

  return errors;
};
const validateUserLogin = (data) => {
  const { email, password } = data;
  const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  const isEmailValid = reg.test(email);
  const errors = {};

  if (!email || !password) {
    errors.required = "Email and password are required";
  } else if (!isEmailValid) {
    errors.email = "Invalid email format";
  }

  return errors;
};

const validateUserId = (userId) => {
  const errors = {};
  if (!userId) {
    errors.userId = "The userId is required";
  }
  return errors;
};

const validateToken = (token) => {
  const errors = {};
  if (!token) {
    errors.token = "The token is required";
  }
  return errors;
};

const validateUpdateUser = (userId, data) => {
  const errors = {};
  if (!userId) {
    errors.userId = "The userId is required";
  }
  if (!data) {
    errors.data = "Update data is required";
  }
  return errors;
};

module.exports = {
  validateUserCreate,
  validateUserLogin,
  validateUserId,
  validateToken,
  validateUpdateUser,
};
