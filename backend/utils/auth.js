const jwt = require("jsonwebtoken");
const { Checkgroup } = require("../models/accounts");

//test
// Middleware to extract and verify JWT token
exports.authenticateToken = (req, res, next) => {
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

// Middleware to check if user is authenticated
exports.isAuthenticatedUser = (...groupnames) => {
  return async (req, res, next) => {
    const token = req.cookies.jwt; // Extract the token from the cookies

    if (!token) {
      return res
        .status(401)
        .json({ error: "Login first to access this resource." });
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      //console.log("in auth " + decoded.payload.user);
      req.user = decoded.payload.user;

      const isAuthorized = await Checkgroup(req.user, groupnames);
      console.log("In auth check isAuthorised " + isAuthorized);

      if (!isAuthorized) {
        return res.status(403).json({
          error: `User ${req.user} is not allowed to access this resource.`,
        });
      }

      next();
    } catch (error) {
      //console.error("Authentication/Authorization error:", error);
      if (error.name === "TokenExpiryedError") {
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

/*exports.isAuthenticatedUser = (getGroupnames) => {
  return async (req, res, next) => {
    const token = req.cookies.jwt; // Extract the token from the cookies

    if (!token) {
      return res
        .status(401)
        .json({ error: "Login first to access this resource." });
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded.payload.user;

      // Get the group names dynamically
      const groupnames = await getGroupnames(req.user);

      const isAuthorized = await Checkgroup(req.user, groupnames);
      console.log("In auth check isAuthorized " + isAuthorized);

      if (!isAuthorized) {
        return res.status(403).json({
          error: `User ${req.user} is not allowed to access this resource.`,
        });
      }s

      next();
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


const getGroupnamesFromDB = async (user) => {
  // Replace this with actual database query logic
  // Example using a mock database function:
  const userGroups = await db.query('SELECT groupname FROM user_groups WHERE username = ?', [user]);
  return userGroups.map(row => row.groupname);
};


const express = require('express');
const router = express.Router();

router
  .route("/editPlan")
  .post(issDisabled, isAuthenticatedUser(getGroupnamesFromDB), editPlan);

*/
