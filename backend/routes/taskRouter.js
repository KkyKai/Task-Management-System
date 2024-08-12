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
  editPlan,
  createTask,
  getAppPermitCreate,
  getAppPermitOpen,
  getAppPermitTodo,
  getAppPermitDoing,
  getAppPermitDone,
  getAllTask,
  getTaskDetails,
  getAuditTrail,
} = require("../controllers/taskController");

const jwt = require("jsonwebtoken");

const { issDisabled } = require("../utils/isDisabled");
const { authenticateToken, isAuthenticatedUser } = require("../utils/auth");

const {
  checkCreatePermission,
  checkOpenPermission,
  checkTodoPermission,
  checkDoingPermission,
  checkDonePermission,
  getPermit,
} = require("../utils/permit");

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
  .post(issDisabled, authenticateToken, getApplicationPlan);

router
  .route("/editPlan")
  .post(issDisabled, isAuthenticatedUser("projectmanager"), editPlan);

router
  .route("/getAppPermitCreate")
  .post(issDisabled, authenticateToken, getAppPermitCreate);
router
  .route("/getAppPermitOpen")
  .post(issDisabled, authenticateToken, getAppPermitOpen);
router
  .route("/getAppPermitTodo")
  .post(issDisabled, authenticateToken, getAppPermitTodo);
router
  .route("/getAppPermitDoing")
  .post(issDisabled, authenticateToken, getAppPermitDoing);
router
  .route("/getAppPermitDone")
  .post(issDisabled, authenticateToken, getAppPermitDone);

router.route("/getAllTask").post(issDisabled, authenticateToken, getAllTask);

router
  .route("/createTask")
  .post(issDisabled, checkCreatePermission, createTask);

router
  .route("/getTaskDetails")
  .post(issDisabled, authenticateToken, getTaskDetails);

router
  .route("/getAuditTrail")
  .post(issDisabled, authenticateToken, getAuditTrail);

module.exports = router;
