const express = require("express");
const router = express.Router();

const {
  login,
  logout,
} = require("../controllers/authController");

// Route to login
router.route("/login").post(login);

router.route("/logout").post(logout);

module.exports = router;
