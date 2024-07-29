const express = require("express");
const router = express.Router();
const {
  getAllAccounts,
  getAllGroups,
  createAccount,
  login,
  logout,
  getUserInfo,
  updateUser,
  updateGroup,
  removeGroup,
  addGroup,
} = require("../controllers/accountController");

const { isAuthenticatedUser } = require("../utils/auth");

// Route to retrieve all account info
router
  .route("/getAllAccounts")
  .get(isAuthenticatedUser("admin", "project lead"), getAllAccounts);

router
  .route("/getAllGroups")
  .get(isAuthenticatedUser("admin", "project lead"), getAllGroups);

// Route to create account
router.route("/createAccount").post(createAccount);

// Route to create account
router.route("/updateUser/:username").put(updateUser);

router.route("/updateGroup/:id").put(updateGroup);

router.route("/removeGroup/:id").delete(removeGroup);

router.route("/addGroup").post(addGroup);

// Route to login
router.route("/login").post(login);

router.route("/logout").post(logout);

router
  .route("/getUserInfo")
  .get(isAuthenticatedUser("admin", "project lead"), getUserInfo);

module.exports = router;
