// IMPORTS -
const mongoose = require("mongoose");

// PRODUCT SCHEMA -
const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a product name"],
    trim: true,
    unique: true,
  },

  description: {
    type: String,
    required: [true, "Please enter a product description"],
  },

  price: {
    type: Number,
    required: [true, "Please enter a product price"],
    maxLength: [8, "The price cannot exceed 8 characters"],
    select: false,
  },

  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },

  stock: {
    type: Number,
    required: [true, "Please enter a product stock"],
    maxLength: [4, "The stock cannot exceed 4 characters"],
    default: 1,
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

module.exports = mongoose.model("Product", productSchema);
