const express = require("express");
const router = express.Router();
const {
  getAllAccounts,
  createAccount,
  login,
  logout,
  getUserInfo,
} = require("../controllers/accountController");

const { isAuthenticatedUser } = require("../utils/auth");

// Route to retrieve all account info
router
  .route("/getAllAccounts")
  .get(isAuthenticatedUser("admin", "project lead"), getAllAccounts);

// Route to create account
router.route("/createAccount").post(createAccount);

// Route to login
router.route("/login").post(login);

router.route("/logout").post(logout);

router.route("/getUserInfo").get(isAuthenticatedUser("admin"), getUserInfo);

module.exports = router;
