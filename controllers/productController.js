// IMPORTS -
const productSchema = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const AsyncErr = require("../middlewares/asyncErr");
const cloudinary = require("cloudinary");
const ApiFeatures = require("../utils/apiFeatures");

// GET ALL PRODUCTS (USER) -
exports.getProducts = AsyncErr(async (req, res, next) => {
  const productCount = await productSchema.countDocuments();
  const resultPerPage = 10;
  const apiFeatures = new ApiFeatures(productSchema.find(), req.query)
    .search()
    .pagination(resultPerPage);
  const products = await apiFeatures.query;

  res.status(201).json({
    success: true,
    products,
    productCount,
    resultPerPage,
  });
});

// GET ALL FORMULA PRODUCTS (USER) -
exports.getFormulaProducts = AsyncErr(async (req, res, next) => {
  const products = await productSchema.find();

  res.status(201).json({
    success: true,
    products,
  });
});

// GET SINGLE PRODUCT (USER) -
exports.singleUserProduct = AsyncErr(async (req, res, next) => {
  let product = await productSchema.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(202).json({
    success: true,
    product,
  });
});

// CREATE PRODUCT (ADMIN) -
exports.createProduct = AsyncErr(async (req, res, next) => {
  const { name, description, stock, price, image } = req.body;

  if (!name || !description || !stock || !price || !image) {
    return next(new ErrorHandler("Please fill all the fields", 400));
  }

  const user = req.user.id;

  const myCloud = await cloudinary.v2.uploader.upload(image, {
    folder: "Product",
    width: 150,
    crop: "scale",
  });

  await productSchema.create({
    name,
    description,
    stock,
    price,
    image: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
    user,
  });

  res.status(201).json({
    success: true,
    message: "Raw material has been created.",
  });
});

// GET ALL PRODUCTS (ADMIN) -
exports.getAdminProducts = AsyncErr(async (req, res, next) => {
  const products = await productSchema.find().select("+price");

  res.status(200).json({
    success: true,
    products,
  });
});

// UPDATE PRODUCT (ADMIN) -
exports.updateAdminProduct = AsyncErr(async (req, res, next) => {
  let product = await productSchema.findById(req.params.id).select("+price");

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const newProductData = {
    name: req.body.name,
    description: req.body.description,
    stock: req.body.stock,
    price: req.body.price,
  };

  if (req.body.active) {
    const imageID = product.image.public_id;
    await cloudinary.v2.uploader.destroy(imageID);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "Product",
      width: 150,
      crop: "scale",
    });

    newProductData.image = {
      public_id: myCloud.public_id,
      url: myCloud.url,
    };
  }

  await product.updateOne(newProductData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(202).json({
    success: true,
    message: "Raw material has been updated.",
    product,
  });
});

// DELETE PRODUCT (ADMIN) -
exports.deleteAdminProduct = AsyncErr(async (req, res, next) => {
  let product = await productSchema.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  await cloudinary.v2.uploader.destroy(product.image.public_id);

  await product.deleteOne();

  res.status(202).json({
    success: true,
    message: "Raw material has been deleted",
  });
});
