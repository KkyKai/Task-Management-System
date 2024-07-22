const jwt = require("jsonwebtoken");
const { findByUserName } = require("../models/accounts"); // Adjust path as needed

// Middleware to check if user is authenticated
exports.isAuthenticatedUser = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ error: "Login first to access this resource." });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    //console.log(decoded);

    // Find user by username
    req.user = await findByUserName(decoded.user);

    /* const isUserInGroup = await Checkgroup(decoded.user, 'desired_group_name');

    if (!isUserInGroup) {
      return res.status(403).json({ error: "Unauthorized: User does not belong to the required group." });
    } */

    console.log(req.user);

    if (!req.user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Successfully authenticated, proceed to next middleware or route handler
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

// Middleware to authorize based on roles
exports.authorizeRoles = (...groupname) => {
  return (req, res, next) => {
    if (!groupname.includes(req.user.groupname)) {
      return res.status(403).json({
        error: `Role (${req.user.groupname}) is not allowed to access this resource.`,
      });
    }
    next();
  };
};

/*
// auth.js
const { Checkgroup } = require("../models/accounts");

// Middleware to authorize based on roles
exports.authorizeRoles = (...groupnames) => {
  return async (req, res, next) => {
    try {
      const authorized = await Promise.all(groupnames.map(groupname => Checkgroup(req.user.id, groupname)));
      
      if (!authorized.includes(true)) {
        return res.status(403).json({
          error: `User is not authorized to access this resource with roles (${groupnames.join(', ')}).`,
        });
      }
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
};
*/
