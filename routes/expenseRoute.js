// IMPORTS -
const express = require("express");
const { isAuthUser, authorizeRoles } = require("../middlewares/auth");
const {
  createExp,
  getExpenses,
  getSingleExp,
  updateExp,
  deleteExp,
  getAdminExpenses,
} = require("../controllers/expenseController");
const router = express.Router();

// USER -
router
  .route("/expense/create")
  .post(isAuthUser, authorizeRoles("user"), createExp);
router
  .route("/expense/all")
  .get(isAuthUser, authorizeRoles("user"), getExpenses);

// ADMIN -
router
  .route("/admin/expense/:id")
  .put(isAuthUser, authorizeRoles("admin"), updateExp)
  .delete(isAuthUser, authorizeRoles("admin"), deleteExp);

router
  .route("/admin/expense/all")
  .get(isAuthUser, authorizeRoles("admin"), getAdminExpenses);

module.exports = router;
