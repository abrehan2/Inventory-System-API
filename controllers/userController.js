// IMPORTS -
const ErrorHandler = require("../utils/errorHandler");
const AsyncErr = require("../middlewares/asyncErr");
const userModel = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const crypto = require("crypto");
const validator = require("validator");
const sendEmail = require("../utils/sendEmail");
const ApiFeatures = require("../utils/apiFeatures");

// REGISTER A USER -
exports.registerUser = AsyncErr(async (req, res, next) => {
  const { name, email, password } = req.body;

  // FILLING ALL THE FIELDS -
  if (!name || !email || !password) {
    return next(new ErrorHandler("Please fill all the fields", 400));
  }

  // REGISTERING A USER -
  const user = await userModel.findOne({ email });

  if (user === null) {
    await userModel.create({ name, email, password });
    res.status(201).json({
      success: true,
      message: "You are registered! Please login to proceed",
    });
  } else {
    res.status(406).json({
      message: "User already exists",
    });
  }
});

// LOGIN -
exports.loginUser = AsyncErr(async (req, res, next) => {
  const { email, password } = req.body;

  // FILLING ALL THE FIELDS -
  if (!email || !password) {
    return next(new ErrorHandler("Please fill all the fields", 400));
  }

  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // VALIDATE PASSWORD -
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(user, 200, res);
});

// LOGOUT USER -
exports.logoutUser = AsyncErr(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// FORGOT PASSWORD -
exports.forgotPassword = AsyncErr(async (req, res, next) => {
  const { email } = req.body;

  // FILLING ALL THE FIELDS -
  if (!email) {
    return next(new ErrorHandler("Please fill all the fields", 400));
  }

  // CHECK IF THE EMAIL IS CORRECT -
  if (validator.isEmail(email) !== true) {
    return next(new ErrorHandler("Please enter a valid email", 400));
  }

  // VALIDATE A USER -
  const user = await userModel.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // GET RESET PASSWORD TOKEN -
  const token = user.ResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${token}`;

  const message = `Please click the link below to reset your password as per your request:\n\n ${resetUrl}\n\nIn case you haven't made a request for this email, kindly disregard it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Hi-Class Feed Mill Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(err.message, 500));
  }
});

// RESET PASSWORD -
exports.resetPassword = AsyncErr(async (req, res, next) => {
  const { password, confirmPassword } = req.body;

  // CREATING TOKEN HASH -
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await userModel.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Token is invalid or has expired", 400));
  }

  // FILLING ALL THE FIELDS -
  if (!password || !confirmPassword) {
    return next(new ErrorHandler("Please fill all the fields", 400));
  }

  // COMPARE PASSWORDS -
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  sendToken(user, 200, res);
});

// GET USER DETAILS -
exports.getUserDetails = AsyncErr(async (req, res) => {
  const user = await userModel.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// UPDATE USER PASSWORD -
exports.updatePassword = AsyncErr(async (req, res, next) => {
  // FILLING ALL THE FIELDS -
  if (
    !req.body.newPassword ||
    !req.body.confirmPassword ||
    !req.body.oldPassword
  ) {
    return next(new ErrorHandler("Please fill all the fields", 400));
  }

  const user = await userModel.findById(req.user.id).select("+password");
  const isMatched = await user.comparePassword(req.body.oldPassword);

  if (!isMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res);
});

// UPDATE USER PROFILE -
exports.updateProfile = AsyncErr(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await userModel.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    isUpdated: true,
  });
});

exports.getUser = AsyncErr(async (req, res, next) => {
  const user = await userModel.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`User does not exist`, 400));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// GET ALL USERS (ADMIN)
exports.getAllUsers = AsyncErr(async (req, res, next) => {
  const userCount = await userModel.countDocuments();
  const resultPerPage = 10;
  const apiFeatures = new ApiFeatures(userModel.find(), req.query)
    .search()
    .pagination(resultPerPage);

  const users = await apiFeatures.query;

  res.status(200).json({
    success: true,
    users,
    userCount,
    resultPerPage,
  });
});

// UPDATE USER ROLE (ADMIN)
exports.updateUser = AsyncErr(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await userModel.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// DELETE USER ROLE (ADMIN)
exports.deleteUserAdmin = AsyncErr(async (req, res, next) => {
  const user = await userModel.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`User does not exist`, 400));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User has been deleted",
  });
});
