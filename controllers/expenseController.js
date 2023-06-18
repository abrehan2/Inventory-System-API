// IMPORTS -
const ErrorHandler = require("../utils/errorHandler");
const AsyncErr = require("../middlewares/asyncErr");
const ApiFeatures = require("../utils/apiFeatures");
const expenseSchema = require("../models/expenseModel");

// CREATE EXPENSE (USER) -
exports.createExp = AsyncErr(async (req, res, next) => {
  const { name, description, amount, date } = req.body;

  if (!name || !description || !amount || !date) {
    return next(new ErrorHandler("Please fill all the fields", 400));
  }

  await expenseSchema.create({
    name,
    description,
    amount,
    date,
    user: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: "The expense has been created",
  });
});

// GET EXPENSES -
exports.getExpenses = AsyncErr(async (req, res, next) => {
  const expenses = await expenseSchema.find();
  let totalAmount = null;

  expenses.forEach((item) => (totalAmount += item.amount));

  res.status(200).json({
    success: true,
    expenses,
    totalAmount,
  });
});

// GET ADMIN EXPENSES -
exports.getAdminExpenses = AsyncErr(async (req, res, next) => {
  const expenses = await expenseSchema.find();
  let totalAmount = null;

  expenses.forEach((item) => (totalAmount += item.amount));

  res.status(200).json({
    success: true,
    expenses,
    totalAmount,
  });
});

// UPDATE EXPENSE (ADMIN) -
exports.updateExp = AsyncErr(async (req, res, next) => {
  const exp = await expenseSchema.findById(req.params.id);

  if (!exp) {
    return next(new ErrorHandler("Expense details not found", 404));
  }

  const newData = {
    name: req.body.name,
    description: req.body.description,
    date: req.body.date,
    amount: req.body.amount,
  };

  await exp.updateOne(newData, {
    new: true,
    useFindAndModify: false,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Expense details have been updated",
  });
});

// DELETE EXPENSE (ADMIN) -
exports.deleteExp = AsyncErr(async (req, res, next) => {
  const exp = await expenseSchema.findById(req.params.id);

  if (!exp) {
    return next(new ErrorHandler("Expense details not found", 404));
  }

  await exp.deleteOne();

  res.status(200).json({
    success: true,
    message: "Expense details have been deleted",
  });
});
