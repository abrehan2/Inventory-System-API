// IMPORTS -
const saleSchema = require("../models/saleModel");
const ErrorHandler = require("../utils/errorHandler");
const AsyncErr = require("../middlewares/asyncErr");
const ApiFeatures = require("../utils/apiFeatures");
const formulaSchema = require("../models/formulaModel");
const productSchema = require("../models/productModel");
const saleModel = require("../models/saleModel");

// CREATE SALE'S RECORD -
exports.CreateSales = AsyncErr(async (req, res, next) => {
  const {
    name,
    contact,
    formulaName,
    quantity,
    price,
    paid,
    type,
    date,
    productName,
  } = req.body;
  const user = req.user.id;
  let total = null;
  let remaining = null;

  if (!type) {
    return next(new ErrorHandler("Please choose a type", 400));
  }

  if (!name || !contact || !quantity || !price || !paid || !date) {
    return next(new ErrorHandler("Please fill all the required fields", 400));
  }

  if (contact.length !== 11) {
    return next(
      new ErrorHandler("Please enter the phone number with 11 digits", 400)
    );
  }

  if (type === "Dealer" && (!formulaName || !type)) {
    return next(new ErrorHandler("Please fill all the fields for dealer", 400));
  }

  if (type === "Vendor" && (!productName || !type)) {
    return next(new ErrorHandler("Please fill all the fields for vendor", 400));
  }

  const checkItem =
    type === "Dealer"
      ? await formulaSchema.findOne({ name: formulaName })
      : await productSchema.findOne({ name: productName });

  if (!checkItem) {
    return next(new ErrorHandler(type + " not found", 400));
  } else {
    total = quantity * price;
    remaining = total - paid;

    if (paid > total) {
      return next(
        new ErrorHandler("Paid amount cannot be greater than total", 400)
      );
    }

    const saleData = {
      name,
      contact,
      quantity,
      price,
      total,
      paid,
      remaining,
      user,
      [type === "Dealer" ? "formula" : "product"]: checkItem._id,
      type,
      date,
    };

    await saleSchema.create(saleData);

    res.status(201).json({
      success: true,
      message: `The ${type.toLowerCase()}'s record has been saved`,
    });
  }
});

// GET SALES -
exports.getSales = AsyncErr(async (req, res, next) => {
  const sales = await saleSchema.find();

  res.status(200).json({
    success: true,
    sales,
  });
});

// GET ADMIN SALES -
exports.getAdminSales = AsyncErr(async (req, res, next) => {
  const sales = await saleSchema.find();

  res.status(200).json({
    success: true,
    sales,
  });
});

// DELETE DEALER (ADMIN) -
exports.deleteSale = AsyncErr(async (req, res, next) => {
  const sale = await saleSchema.findById(req.params.id);

  if (!sale) {
    return next(new ErrorHandler(`Record does not exist`, 404));
  }

  await sale.deleteOne();

  res.status(200).json({
    sucess: true,
    message: "Record has been deleted",
  });
});
