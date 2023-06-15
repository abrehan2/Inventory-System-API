// IMPORTS -
const ErrorHandler = require("../utils/errorHandler");

// ERROR HANDLING FUNCTION -
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  // WRONG MONGOOSE ID ERROR -
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // MONGOOSE DUPLICATE KEY ERROR -
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

  // WRONG JWT ERROR -
  if (err.name === "JsonWebTokenError") {
    const message = `Json web token is invalid, please try again`;
    err = new ErrorHandler(message, 400);
  }

  // JWT EXPIRE ERROR -
  if (err.name === "TokenExpiredError") {
    const message = `Json web token is expired, please try again`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
