// IMPORTS -
const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUsers,
  getUser,
  updateUser,
  deleteUserAdmin,
} = require("../controllers/userController");
const router = express.Router();
const { isAuthUser, authorizeRoles } = require("../middlewares/auth");

// USER -
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthUser, getUserDetails);
router.route("/password/update").put(isAuthUser, updatePassword);
router.route("/me/update").put(isAuthUser, updateProfile);

// ADMIN -
router
  .route("/admin/users")
  .get(isAuthUser, authorizeRoles("admin"), getAllUsers);
router
  .route("/admin/user/:id")
  .get(isAuthUser, authorizeRoles("admin"), getUser)
  .put(isAuthUser, authorizeRoles("admin"), updateUser)
  .delete(isAuthUser, authorizeRoles("admin"), deleteUserAdmin);

module.exports = router;
