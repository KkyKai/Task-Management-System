const jwt = require("jsonwebtoken");
const { Checkgroup } = require("../models/accounts");
const connection = require("../sqlconnection");

async function getPermit(permitType, acronym) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT ${permitType} FROM application WHERE app_acronym = ?;`,
      [acronym],
      (error, results) => {
        if (error) {
          console.error("Error in database query:", error);
          return reject(error);
        }
        console.log("Database query results:", results);
        resolve(results[0] ? results[0][permitType] : null);
      }
    );
  });
}

const checkPermission = (permitType) => {
  return async (req, res, next) => {
    const token = req.cookies.jwt; // Extract the token from the cookies

    console.log(req.cookies.jwt);

    if (!token) {
      return res
        .status(401)
        .json({ error: "Login first to access this resource." });
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded.payload.user;

      //console.log(req.user);

      const acronym = req.body.task_app_Acronym;

      console.log(acronym);
      //console.log(permitType);

      // Fetch the relevant permit information
      const permit = await getPermit(permitType, acronym);

      console.log("Fetched permit:", permit);

      // Check if the user's group is listed in the permit information
      if (permit) {
        const isAuthorized = await Checkgroup(req.user, permit);
        if (isAuthorized) {
          return next();
        }
      }

      return res.status(403).json({
        error: `User ${req.user} is not allowed to access this resource.`,
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ error: "Token expired, please log in again." });
      }
      return res
        .status(401)
        .json({ error: "Invalid token, please log in again." });
    }
  };
};

// Create specific middleware functions for each permit type
const checkCreatePermission = checkPermission("app_permit_create");
const checkOpenPermission = checkPermission("app_permit_open");
const checkTodoPermission = checkPermission("app_permit_todolist");
const checkDoingPermission = checkPermission("app_permit_doing");
const checkDonePermission = checkPermission("app_permit_done");

module.exports = {
  checkCreatePermission,
  checkOpenPermission,
  checkTodoPermission,
  checkDoingPermission,
  checkDonePermission,
  getPermit,
};
