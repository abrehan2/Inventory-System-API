// IMPORTS -
const mongoose = require("mongoose");

// FORMULA SCHEMA -
const batchSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a batch name"],
    trim: true,
    unique: true,
  },

  batchNumber: {
    type: Number,
    required: [true, "Please enter a batch number"],
  },

  formula: {
    type: mongoose.Schema.ObjectId,
    ref: "Formula",
    required: true,
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Batch", batchSchema);
