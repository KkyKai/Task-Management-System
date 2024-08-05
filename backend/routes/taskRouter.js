const express = require("express");
const router = express.Router();
const {
  getAllApplications,
  createApplication,
} = require("../controllers/taskController");

const jwt = require("jsonwebtoken");

const { issDisabled } = require("../utils/isDisabled");
const { authenticateToken, isAuthenticatedUser } = require("../utils/auth");

router
  .route("/getAllApplications")
  .post(issDisabled, isAuthenticatedUser("user"), getAllApplications);

router
  .route("/createApplication")
  .post(issDisabled, isAuthenticatedUser("user"), createApplication);

module.exports = router;
