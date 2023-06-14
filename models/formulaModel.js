// IMPORTS -
const mongoose = require("mongoose");

// FORMULA SCHEMA -
const formulaSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a formula name"],
    trim: true,
    unique: true,
  },

  formulaDetails: [
    {
      quantity: {
        type: Number,
        required: [true, "Please enter a formula quantity"],
      },

      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
    },
  ],

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },

  formulaStatus: {
    type: String,
    required: true,
    default: "Processing",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Formula", formulaSchema);
