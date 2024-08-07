const express = require("express");
const router = express.Router();
const {
  checkPL,
  checkPM,
  getAllAppNames,
  createApplication,
  getApplicationDetails,
  editApplication,
  createPlan,
  getAllPlans,
  getApplicationPlan,
} = require("../controllers/taskController");

const jwt = require("jsonwebtoken");

const { issDisabled } = require("../utils/isDisabled");
const { authenticateToken, isAuthenticatedUser } = require("../utils/auth");

router
  .route("/getAllAppNames")
  .post(issDisabled, authenticateToken, getAllAppNames);

//Check if User is ProjectLead for ProjectLead Protected Routes and rendering of buttons
router.get("/check-projlead", authenticateToken, checkPL);

//Check if User is Project Manager for Project Manager Protected Routes and rendering of buttons
router.get("/check-projmg", authenticateToken, checkPM);

router
  .route("/createApplication")
  .post(issDisabled, isAuthenticatedUser("projectlead"), createApplication);

router
  .route("/getApplicationDetails")
  .post(issDisabled, isAuthenticatedUser("projectlead"), getApplicationDetails);

router
  .route("/editApplication")
  .post(issDisabled, isAuthenticatedUser("projectlead"), editApplication);

router
  .route("/createPlan")
  .post(issDisabled, isAuthenticatedUser("projectmanager"), createPlan);

router
  .route("/getAllPlans")
  .post(
    issDisabled,
    isAuthenticatedUser("projectmanager", "projectlead"),
    getAllPlans
  );

router
  .route("/getApplicationPlan")
  .post(issDisabled, isAuthenticatedUser("projectmanager"), getApplicationPlan);

module.exports = router;
