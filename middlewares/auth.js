// IMPORTS -
const ErrorHandler = require("../utils/errorHandler");
const AsynErr = require("./asyncErr");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

// AUTHENTICATE USER -
exports.isAuthUser = AsynErr(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("Please login to access", 401));
  }

  const decodeData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await userModel.findById(decodeData.id);

  next();
});

// CHECK ROLES -
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};
