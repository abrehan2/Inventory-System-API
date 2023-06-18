// IMPORTS -
const express = require("express");
const router = express.Router();
const {
  CreateSales,
  getSales,
  getAdminSales,
  deleteSale,
} = require("../controllers/saleController");
const { isAuthUser, authorizeRoles } = require("../middlewares/auth");

// USER -
router
  .route("/sale/create")
  .post(isAuthUser, authorizeRoles("user"), CreateSales);
router.route("/sale").get(isAuthUser, authorizeRoles("user"), getSales);

// ADMIN -
router
  .route("/sale/admin/:id")
  .delete(isAuthUser, authorizeRoles("admin"), deleteSale);
router
  .route("/sale/admin/all")
  .get(isAuthUser, authorizeRoles("admin"), getAdminSales);

module.exports = router;
