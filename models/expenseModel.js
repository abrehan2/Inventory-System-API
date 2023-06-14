// IMPORTS -
const mongoose = require("mongoose");

// EXPENSE SCHEMA -
const expenseSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter the expense name"],
    maxLength: [30, "Expense name cannot exceed 30 characters"],
    minLength: [
      4,
      "Please ensure that the expense name contains at least 5 characters",
    ],
  },

  description: {
    type: String,
    required: [true, "Please enter the description"],
    maxLength: [100, "Description cannot exceed 100 characters"],
    minLength: [
      4,
      "Please ensure that the description contains at least 5 characters",
    ],
  },

  date: {
    type: Date,
    required: true,
  },

  amount: {
    type: Number,
    required: [true, "Please enter the total amount"],
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
})

module.exports = mongoose.model("Expense", expenseSchema);
