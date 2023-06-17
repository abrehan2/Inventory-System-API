// IMPORTS -
const express = require("express");
const router = express.Router();
const { isAuthUser, authorizeRoles } = require("../middlewares/auth");
const { newOrder, myFormula, allAdminFormula, updateAdminStatus, updateAdminFormula, deleteAdminFormula, getBatch, createBatch, useStock, getAdminBatch, updateAdminBatch, deleteAdminBatch } = require("../controllers/formulaController");

// USER -
router.route("/formula/create").post(isAuthUser, authorizeRoles("user"), newOrder);
router.route("/formula/me").get(isAuthUser, authorizeRoles("user"), myFormula);
router.route("/formula/batch/create").post(isAuthUser, authorizeRoles("user"), createBatch);
router.route("/batch").get(isAuthUser, authorizeRoles("user"), getBatch)
router.route("/batch/use").post(isAuthUser, authorizeRoles("user"), useStock);

// ADMIN -
router.route("/admin/formula").get(isAuthUser, authorizeRoles("admin"), allAdminFormula);
router.route("/admin/formula/status/:id").put(isAuthUser, authorizeRoles("admin"), updateAdminStatus);
router.route("/admin/formula/:id").put(isAuthUser, authorizeRoles("admin"), updateAdminFormula).delete(isAuthUser, authorizeRoles("admin"), deleteAdminFormula);

router.route("/admin/batches").get(isAuthUser, authorizeRoles("admin"), getAdminBatch);
router.route("/admin/batch/:id").put(isAuthUser, authorizeRoles("admin"), updateAdminBatch).delete(isAuthUser, authorizeRoles("admin"), deleteAdminBatch);

module.exports = router;
