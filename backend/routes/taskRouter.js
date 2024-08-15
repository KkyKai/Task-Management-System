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
  updateTaskWithStateChange,
  updateTaskNoStateChange,
  rejectTaskWithStateChange,
  groupnametest,
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
  .route("/editPlan")
  .post(issDisabled, isAuthenticatedUser("projectmanager"), editPlan);

router
  .route("/getApplicationPlan")
  .post(issDisabled, authenticateToken, getApplicationPlan);

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
  .route("/getTaskDetails")
  .post(issDisabled, authenticateToken, getTaskDetails);

router
  .route("/getAuditTrail")
  .post(issDisabled, authenticateToken, getAuditTrail);

router
  .route("/createTask")
  .post(issDisabled, checkCreatePermission, createTask);

router
  .route("/updateTaskWithStateChangeOpen")
  .post(issDisabled, checkOpenPermission, updateTaskWithStateChange);

router
  .route("/updateTaskWithStateChangeToDo")
  .post(issDisabled, checkTodoPermission, updateTaskWithStateChange);

router
  .route("/updateTaskWithStateChangeDoing")
  .post(issDisabled, checkDoingPermission, updateTaskWithStateChange);

router
  .route("/updateTaskWithStateChangeDone")
  .post(issDisabled, checkDonePermission, updateTaskWithStateChange);

router
  .route("/updateTaskWithNoStateChangeOpen")
  .post(issDisabled, checkOpenPermission, updateTaskNoStateChange);

router
  .route("/updateTaskWithNoStateChangeToDo")
  .post(issDisabled, checkTodoPermission, updateTaskNoStateChange);

router
  .route("/updateTaskWithNoStateChangeDoing")
  .post(issDisabled, checkDoingPermission, updateTaskNoStateChange);

router
  .route("/updateTaskWithNoStateChangeDone")
  .post(issDisabled, checkDonePermission, updateTaskNoStateChange);

router
  .route("/rejectTaskWithStateChangeDoing")
  .post(issDisabled, checkDoingPermission, rejectTaskWithStateChange);

router
  .route("/rejectTaskWithStateChangeDone")
  .post(issDisabled, checkDonePermission, rejectTaskWithStateChange);

router.route("/grptest").post(groupnametest);

/*router
  .route("/getAllPlans")
  .post(
    issDisabled,
    isAuthenticatedUser("projectmanager", "projectlead"),
    getAllPlans
  ); */

module.exports = router;
