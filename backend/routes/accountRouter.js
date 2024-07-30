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
  createUserGroup,
  getGroupbyUsers,
  selectByUsers,
  updateSelectedUser,
} = require("../controllers/accountController");

const { isAuthenticatedUser } = require("../utils/auth");

// Route to retrieve all account info
router
  .route("/getAllAccounts")
  .get(isAuthenticatedUser("admin"), getAllAccounts);

router
  .route("/getGroupbyUsers/:username")
  .get(isAuthenticatedUser("admin"), getGroupbyUsers);

router.route("/getAllGroups").get(isAuthenticatedUser("admin"), getAllGroups);

// Route to create account
//router.route("/createAccount").post(isAuthenticatedUser("admin"), createAccount);

  router.route("/createAccount").post(createAccount);

router
  .route("/createUserGroup")
  .post(isAuthenticatedUser("admin"), createUserGroup);

// Route to create account
router
  .route("/updateUser/:username")
  .put(isAuthenticatedUser("admin"), updateUser);

router.route("/updateGroup/:id").put(isAuthenticatedUser("admin"), updateGroup);

router.route("/removeGroup").delete(isAuthenticatedUser("admin"), removeGroup);

router.route("/addGroup").post(isAuthenticatedUser("admin"), addGroup);

router.route("/selectByUsers/:user").get(selectByUsers);

router.route("/updateSelectedUser/:username").put(updateSelectedUser);

router.route("/getUserInfo").get(isAuthenticatedUser("admin"), getUserInfo);

// Route to login
router.route("/login").post(login);

router.route("/logout").post(logout);

module.exports = router;
