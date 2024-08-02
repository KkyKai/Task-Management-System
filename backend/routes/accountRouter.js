const express = require("express");
const router = express.Router();
const {
  getAllAccounts,
  getAllGroups,
  createAccount,
  login,
  logout,
  //getUserInfo,
  updateUser,
  //updateGroup,
  removeGroup,
  addGroup,
  createUserGroup,
  getGroupbyUsers,
  selectByUsers,
  updateSelectedUser,
  getUserStatus,
  checkAuthStatus,
} = require("../controllers/accountController");

const { findByUserName, Checkgroup } = require("../models/accounts");

const jwt = require("jsonwebtoken");

const { issDisabled } = require("../utils/isDisabled");
const { isAuthenticatedUser } = require("../utils/auth");

// Route to retrieve all account info
router
  .route("/getAllAccounts/:username")
  .get(issDisabled, isAuthenticatedUser("admin"), getAllAccounts);

router
  .route("/getGroupbyUsers/:username")
  .get(issDisabled, isAuthenticatedUser("admin"), getGroupbyUsers);

router
  .route("/getAllGroups/:username")
  .get(issDisabled, isAuthenticatedUser("admin"), getAllGroups);

// Route to create account
router
  .route("/createAccount/:username")
  .post(issDisabled, isAuthenticatedUser("admin"), createAccount);

//For creating super admin
//router.route("/createAccount").post(createAccount);

router
  .route("/createUserGroup/:username")
  .post(issDisabled, isAuthenticatedUser("admin"), createUserGroup);

// Route to create account
router
  .route("/updateUser/:username")
  .put(issDisabled, isAuthenticatedUser("admin"), updateUser);

//router.route("/updateGroup/:id").put(isAuthenticatedUser("admin"), updateGroup);

router
  .route("/removeGroup/:username")
  .delete(issDisabled, isAuthenticatedUser("admin"), removeGroup);

router
  .route("/addGroup/:username")
  .post(issDisabled, isAuthenticatedUser("admin"), addGroup);

//router.route("/getUserInfo").get(isAuthenticatedUser("admin"), getUserInfo);

// Route to login
router.route("/login").post(login);

router.route("/logout").post(logout);

//test
// Middleware to extract and verify JWT token
const authenticateToken = (req, res, next) => {
  //console.log(req.cookies.jwt);
  const token = req.cookies.jwt; // Extract token from cookies

  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token." });
    }

    req.user = user.payload.user;
    next();
  });
};

router
  .route("/selectByUsers/:username")
  .get(issDisabled, authenticateToken, selectByUsers);

router
  .route("/updateSelectedUser/:username")
  .put(authenticateToken, updateSelectedUser);

router.get("/check-auth", authenticateToken, async (req, res) => {
  try {
    console.log("req.user " + req.user);
    const isAdmin = await Checkgroup(req.user, "admin");
    res.json({ isAuthenticated: isAdmin });
  } catch (error) {
    console.error("Error checking user group:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router
  .route("/getUserStatus/:username")
  .get(issDisabled, authenticateToken, getUserStatus);

router.route("/status").get(checkAuthStatus);

module.exports = router;
