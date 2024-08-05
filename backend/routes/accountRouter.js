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
//router.route("/getAllAccounts/:username").get(issDisabled, isAuthenticatedUser("admin"), getAllAccounts);

router
  .route("/getAllAccounts")
  .post(issDisabled, isAuthenticatedUser("admin"), getAllAccounts);

//router.route("/getGroupbyUsers/:username").post(issDisabled, isAuthenticatedUser("admin"), getGroupbyUsers);

router
  .route("/getGroupbyUsers")
  .post(issDisabled, isAuthenticatedUser("admin"), getGroupbyUsers);

//router.route("/getAllGroups/:username").get(issDisabled, isAuthenticatedUser("admin"), getAllGroups);
router
  .route("/getAllGroups")
  .post(issDisabled, isAuthenticatedUser("admin"), getAllGroups);

// Route to create account
//router.route("/createAccount/:username").post(issDisabled, isAuthenticatedUser("admin"), createAccount);
router
  .route("/createAccount")
  .post(issDisabled, isAuthenticatedUser("admin"), createAccount);

//For creating super admin
//router.route("/createAccount").post(createAccount);

//router.route("/createUserGroup/:username").post(issDisabled, isAuthenticatedUser("admin"), createUserGroup);

router
  .route("/createUserGroup")
  .post(issDisabled, isAuthenticatedUser("admin"), createUserGroup);

// Route to create account
//router.route("/updateUser/:username").put(issDisabled, isAuthenticatedUser("admin"), updateUser);

router
  .route("/updateUser")
  .put(issDisabled, isAuthenticatedUser("admin"), updateUser);

//router.route("/removeGroup/:username").delete(issDisabled, isAuthenticatedUser("admin"), removeGroup);
router
  .route("/removeGroup")
  .delete(issDisabled, isAuthenticatedUser("admin"), removeGroup);

//router.route("/addGroup/:username").post(issDisabled, isAuthenticatedUser("admin"), addGroup);

router
  .route("/addGroup")
  .post(issDisabled, isAuthenticatedUser("admin"), addGroup);

//router.route("/selectByUsers/:username").get(issDisabled, authenticateToken, selectByUsers);
router
  .route("/selectByUsers")
  .post(issDisabled, authenticateToken, selectByUsers);

//router.route("/updateSelectedUser/:username").put(authenticateToken, updateSelectedUser);
router
  .route("/updateSelectedUser")
  .put(issDisabled, authenticateToken, updateSelectedUser);

//Check if User is Admin for Admin Protected Routes and Nav Bar
router.get("/check-auth", authenticateToken, checkAuth);

//Do not delete router.route("/status").get(checkAuthStatus);
//router.route("/status").get(checkAuthStatus);
router.route("/status").get(authenticateToken, checkAuthStatus);

//router.route("/updateGroup/:id").put(isAuthenticatedUser("admin"), updateGroup);
//router.route("/getUserInfo").get(isAuthenticatedUser("admin"), getUserInfo);

//router.route("/getUserStatus/:username").get(issDisabled, authenticateToken, getUserStatus);

module.exports = router;
