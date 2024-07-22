const express = require("express");
const router = express.Router();
const {
  getAllAccounts,
  createAccount,
  login,
} = require("../controllers/accountController");

const { isAuthenticatedUser, authorizeRoles } = require("../utils/auth");

// Route to retrieve all account info
router
  .route("/getAllAccounts")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllAccounts);

// Route to create account
router.route("/createAccount").post(createAccount);

// Route to login
router.route("/login").post(login);

module.exports = router;
