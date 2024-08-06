const express = require("express");
const router = express.Router();
const {
  getAllAccounts,
  getAllGroups,
  createAccount,
  updateUser,
  removeGroup,
  addGroup,
  createUserGroup,
  getGroupbyUsers,
  selectByUsers,
  updateSelectedUser,
  getUserStatus,
  checkAuthStatus,
  checkAuth,
} = require("../controllers/accountController");

const jwt = require("jsonwebtoken");

const { issDisabled } = require("../utils/isDisabled");
const { authenticateToken, isAuthenticatedUser } = require("../utils/auth");

// Route to retrieve all account info
router
  .route("/getAllAccounts")
  .post(issDisabled, isAuthenticatedUser("admin"), getAllAccounts);

router
  .route("/getGroupbyUsers")
  .post(issDisabled, isAuthenticatedUser("admin"), getGroupbyUsers);

router
  .route("/getAllGroups")
  .post(issDisabled, authenticateToken, getAllGroups);

// Route to create account
router
  .route("/createAccount")
  .post(issDisabled, isAuthenticatedUser("admin"), createAccount);

//For creating super admin
//router.route("/createAccount").post(createAccount);

router
  .route("/createUserGroup")
  .post(issDisabled, isAuthenticatedUser("admin"), createUserGroup);

router
  .route("/updateUser")
  .put(issDisabled, isAuthenticatedUser("admin"), updateUser);

router
  .route("/removeGroup")
  .delete(issDisabled, isAuthenticatedUser("admin"), removeGroup);

router
  .route("/addGroup")
  .post(issDisabled, isAuthenticatedUser("admin"), addGroup);

router
  .route("/selectByUsers")
  .post(issDisabled, authenticateToken, selectByUsers);

router
  .route("/updateSelectedUser")
  .put(issDisabled, authenticateToken, updateSelectedUser);

//Check if User is Admin for Admin Protected Routes and Nav Bar
router.get("/check-auth", authenticateToken, checkAuth);

//Do not delete router.route("/status").get(checkAuthStatus);
//router.route("/status").get(checkAuthStatus);
router.route("/status").get(authenticateToken, checkAuthStatus);

module.exports = router;
