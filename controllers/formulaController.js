// IMPORTS -
const formulaModel = require("../models/formulaModel");
const ErrorHandler = require("../utils/errorHandler");
const AsyncErr = require("../middlewares/asyncErr");
const batchModel = require("../models/batchModel");
const ApiFeatures = require("../utils/apiFeatures");
const productSchema = require("../models/productModel");

// CREATE ORDER (USER) -
exports.newOrder = AsyncErr(async (req, res, next) => {
  const { name, formulaDetails } = req.body;

  if (!name || !formulaDetails) {
    return next(new ErrorHandler("Please fill all the fields", 400));
  }

  const formulaCreate = await formulaModel.create({
    name,
    formulaDetails,
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
  });
});

// GET MY FORMULAS (USER) -
exports.myFormula = AsyncErr(async (req, res, next) => {
  let formulas = await formulaModel.find({ user: req.user._id });

  const formulasToDelete = await Promise.all(
    formulas.map(async (formula) => {
      const productExists = await productSchema.exists({
        _id: formula.formulaDetails[0].product,
      });
      return productExists ? null : formula._id;
    })
  );

  const formulaIdsToDelete = formulasToDelete.filter(Boolean);

  if (formulaIdsToDelete.length > 0) {
    await formulaModel.deleteMany({ _id: { $in: formulaIdsToDelete } });
  }

  formulas = await formulaModel.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    formulas,
  });
});

// CREATE BATCH (USER) -
exports.createBatch = AsyncErr(async (req, res, next) => {
  const formula = await formulaModel.findOne({
    $and: [{ _id: req.body.id }, { formulaStatus: "Accepted" }],
  });
  const { batchNumber, name } = req.body;
  const user = req.user._id;

  if (!formula) {
    return next(new ErrorHandler("Formula not found", 404));
  }

  await batchModel.create({
    name,
    batchNumber,
    formula,
    user,
  });

  res.status(200).json({
    success: true,
    message: "Batch is created",
  });
});

exports.useStock = AsyncErr(async (req, res, next) => {
  const batch = await batchModel.findById(req.body.id).populate("formula");

  if (!batch) {
    return next(new ErrorHandler("Batch not found", 404));
  }

  const productsWithDeductions = [];

  batch.formula.formulaDetails.forEach((item) => {
    productsWithDeductions.push(item);
  });

  try {
    const allProducts = await fetchAllProducts(productsWithDeductions);

    const allStockSufficient = allProducts.every((product, index) => {
      const requiredDeduction =
        productsWithDeductions[index].quantity * batch.batchNumber;
      return product.stock >= requiredDeduction;
    });

    if (!allStockSufficient) {
      return next(
        new ErrorHandler("Not enough stock for products to use a batch", 400)
      );
    }

    for (const product of allProducts) {
      const requiredDeduction =
        productsWithDeductions.find(
          (item) => item.product.toString() === product._id.toString()
        ).quantity * batch.batchNumber;

      await updateStock(product, requiredDeduction);
    }
  } catch (error) {
    return next(new ErrorHandler(`Error occurred: ${error}`, 404));
  }

  res.status(200).json({
    success: true,
    message: "Batch is used",
  });
});

async function fetchAllProducts(productsWithDeductions) {
  const productIds = productsWithDeductions.map((item) => item.product);
  const productPromises = productIds.map(async (productId) => {
    const query = await productSchema.findById(productId);
    return query;
  });

  return Promise.all(productPromises);
}

async function updateStock(item, requiredDeduction) {
  item.stock -= requiredDeduction;

  if (item.isModified("stock")) {
    await item.save({ validateBeforeSave: false });
  }
}

// GET ALL FORMLUAS (ADMIN) -
exports.allAdminFormula = AsyncErr(async (req, res, next) => {
  const formulas = await formulaModel
    .find()
    .populate("formulaDetails.product", "price stock");

  res.status(200).json({
    success: true,
    formulas,
  });
});

// UPDATE FORMLUA STATUS (ADMIN) -
exports.updateAdminStatus = AsyncErr(async (req, res, next) => {
  const formula = await formulaModel.findById(req.params.id);

  if (!formula) {
    return next(new ErrorHandler("Formula not found", 404));
  }

  if (req.body.status === "Accepted") {
    await formula.updateOne(
      {
        formulaStatus: "Accepted",
      },
      { new: true, runValidators: true, useFindAndModify: false }
    );

    res.status(200).json({
      success: true,
      message: "Formula has been accepted",
    });
  }

  if (req.body.status === "Rejected") {
    await formula.deleteOne();
    res.status(200).json({
      success: true,
      message: "Formula has been rejected",
    });
  }
});

// UPDATE FORMLUA (ADMIN) -
exports.updateAdminFormula = AsyncErr(async (req, res, next) => {
  const formula = await formulaModel.findById(req.params.id);

  if (!formula) {
    return next(new ErrorHandler("Formula not found", 404));
  }

  const newdata = {
    name: req.body.name,
  };

  await formula.updateOne(newdata, {
    new: true,
    useFindAndModify: false,
    runValidators: true,
  });

  res.status(200).json({
    success: "true",
    message: "Formula has been updated",
  });
});

// DELETE FORMLUA (ADMIN) -
exports.deleteAdminFormula = AsyncErr(async (req, res, next) => {
  const formula = await formulaModel.findById(req.params.id);

  if (!formula) {
    return next(new ErrorHandler("Formula not found", 404));
  }

  await formula.deleteOne();

  res.status(200).json({
    success: "true",
    message: "Formula has been deleted",
  });
});

// GET BATCHES -
exports.getBatch = AsyncErr(async (req, res, next) => {
  let batches = await batchModel
    .find({ user: req.user._id })
    .populate("formula");

  const batchIdsToDelete = [];
  const validBatches = [];

  for (const batch of batches) {
    if (!batch.formula) {
      batchIdsToDelete.push(batch._id);
    } else {
      validBatches.push(batch);
    }
  }

  if (batchIdsToDelete.length > 0) {
    await batchModel.deleteMany({ _id: { $in: batchIdsToDelete } });
  }

  res.status(200).json({
    success: true,
    batch: validBatches,
  });
});

// GET ADMIN BATCHES -
exports.getAdminBatch = AsyncErr(async (req, res, next) => {
  let batches = await batchModel
    .find()
    .populate("formula", "name formulaStatus");

  batches &&
    batches.forEach((item) => {
      if (item?.formula === null) {
        item?.deleteOne();
      }
    });

  res.status(200).json({
    success: true,
    batches,
  });
});

// UPDATE ADMIN BATCH (ADMIN) -
exports.updateAdminBatch = AsyncErr(async (req, res, next) => {
  const batch = await batchModel.findById(req.params.id);

  if (!batch) {
    return next(new ErrorHandler("Batch not found", 404));
  }

  const newdata = {
    name: req.body.name,
  };

  await batch.updateOne(newdata, {
    new: true,
    useFindAndModify: false,
    runValidators: true,
  });

  res.status(200).json({
    success: "true",
    message: "Batch has been updated",
  });
});

// DELETE BATCH (ADMIN) -
exports.deleteAdminBatch = AsyncErr(async (req, res, next) => {
  const batch = await batchModel.findById(req.params.id);

  if (!batch) {
    return next(new ErrorHandler("Batch not found", 404));
  }

  await batch.deleteOne();

  res.status(200).json({
    success: "true",
    message: "Batch has been deleted",
  });
});
