const UserService = require("../services/UserService");
const User = require("../models/UserModel");
const JwtService = require("../services/jwtService");
const {
  validateUserCreate,
  validateUserLogin,
  validateUserId,
  validateUpdateUser,
} = require("../validators/userValidator");

// const createUser = async (req, res) => {
//   try {
//     const errors = validateUserCreate(req.body);
//     if (Object.keys(errors).length > 0) {
//       return res.status(400).json({
//         status: "ERR",
//         message: errors,
//       });
//     }

//     const response = await UserService.createUser(req.body);
//     return res.status(201).json(response);
//   } catch (e) {
//     return res.status(500).json({
//       status: "ERR",
//       message: e.message || "An unexpected error occurred",
//     });
//   }
// };

const createUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const isCheckEmail = reg.test(email);
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        status: "ERR",
        message: "The input is required",
      });
    } else if (!isCheckEmail) {
      return res.status(400).json({
        status: "ERR",
        message: "The input is email",
      });
    } else if (password !== confirmPassword) {
      return res.status(400).json({
        status: "ERR",
        message: "The password is equal confirmPassword",
      });
    }
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({
        status: "ERR",
        message: "The email is already in use",
      });
    }
    const response = await UserService.createUser(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const errors = validateUserLogin(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        status: "ERR",
        message: errors,
      });
    }

    const response = await UserService.loginUser(req.body);
    // tách riêng refresh_token từ  response để lưu nó vào cookie
    const { refresh_token, ...newResponse } = response;

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
    });

    return res.status(200).json({ ...newResponse, refresh_token });
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: "An error occurred during login",
      error: e.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;

    const errors = validateUpdateUser(userId, data);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        status: "ERR",
        message: errors,
      });
    }

    const response = await UserService.updateUser(userId, data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json(handleServerError(e));
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const errors = validateUserId(userId);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        status: "ERR",
        message: errors,
      });
    }

    const response = await UserService.deleteUser(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: "An error occurred while deleting the user",
      error: e.message,
    });
  }
};
const getAllUser = async (req, res) => {
  try {
    const response = await UserService.getAllUser();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e,
    });
  }
};

const getDetailsUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const errors = validateUserId(userId);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        status: "ERR",
        message: errors,
      });
    }

    const response = await UserService.getDetailsUser(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: "An error occurred while retrieving user details",
      error: e.message,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };
    res.clearCookie("refresh_token", cookieOptions);
    return res.status(200).json({
      status: "OK",
      message: "Logout successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: "Logout failed",
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    let token = req.headers.token?.split(" ")[1];
    if (!token) {
      return res.status(400).json({
        status: "ERR",
        message: "The token is required",
      });
    }
    const response = await JwtService.refreshTokenJwtService(token);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};
const deleteMany = async (req, res) => {
  try {
    const ids = req.body.ids;
    if (!ids) {
      return res.status(400).json({
        status: "ERR",
        message: "The ids is required",
      });
    }
    const response = await UserService.deleteManyUser(ids);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailsUser,
  refreshToken,
  logoutUser,
  deleteMany,
};
