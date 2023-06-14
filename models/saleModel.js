// IMPORTS -
const mongoose = require("mongoose");

// SALE SCHEMA -
const saleSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter the name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [
      4,
      "Please ensure that the name contains at least 5 characters",
    ],
  },

  contact: {
    type: Number,
    required: [true, "Please enter the phone number"],
  },

  formula: {
    type: mongoose.Schema.ObjectId,
    ref: "Formula",
  },

  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
  },

  date: {
    type: Date,
    required: true,
  },

  type: {
    type: String,
    required: true,
    enum: ["Dealer", "Vendor"],
  },

  quantity: {
    type: Number,
    required: [true, "Please enter the quantity"],
  },

  price: {
    type: Number,
    required: [true, "Please enter the price"],
  },

  total: {
    type: Number,
    required: [true, "Please enter the total amount"],
  },

  paid: {
    type: Number,
    required: [true, "Please enter the paid amount"],
    default: 0,
  },

  remaining: {
    type: Number,
    required: [true, "Please enter the remaining amount"],
    default: 0,
  },

  date: {
    type: Date,
    required: true,
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Sale", saleSchema);
