// IMPORTS -
const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAdminProducts,
  updateAdminProduct,
  deleteAdminProduct,
  getProducts,
  singleUserProduct,
  singleAdminProduct,
  getFormulaProducts,
} = require("../controllers/productController");
const { isAuthUser, authorizeRoles } = require("../middlewares/auth");

// USER -
router.route("/products").get(isAuthUser, authorizeRoles("user"), getProducts);
router
  .route("/products/formula")
  .get(isAuthUser, authorizeRoles("user"), getFormulaProducts);
router
  .route("/product/:id")
  .get(isAuthUser, authorizeRoles("user"), singleUserProduct);

// ADMIN -
router
  .route("/admin/product/new")
  .post(isAuthUser, authorizeRoles("admin"), createProduct);
router
  .route("/admin/products")
  .get(isAuthUser, authorizeRoles("admin"), getAdminProducts);
router
  .route("/admin/product/:id")
  .put(isAuthUser, authorizeRoles("admin"), updateAdminProduct)
  .delete(isAuthUser, authorizeRoles("admin"), deleteAdminProduct);

module.exports = router;
