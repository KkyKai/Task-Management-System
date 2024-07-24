const jwt = require("jsonwebtoken");
const { Checkgroup } = require("../models/accounts");

// Middleware to check if user is authenticated
exports.isAuthenticatedUser = (...groupnames) => {
  return async (req, res, next) => {
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
      req.user = decoded.user;

      const isAuthorized = await Checkgroup(req.user, groupnames);

      if (!isAuthorized) {
        return res
          .status(403)
          .json({
            error: `User ${req.user} is not allowed to access this resource.`,
          });
      }

      next();
    } catch (error) {
      console.error("Authentication/Authorization error:", error);
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

// Middleware to check if user is authenticated
/*exports.isAuthenticatedUser = (...groupnames) => {
  return async (req, res, next) => {
    const token = req.cookies.jwt; // Extract the token from the cookies

    if (!token) {
      return res
        .status(401)
        .json({ error: "Login first to access this resource." });
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded.user;

      const isAuthorized = await Checkgroup(req.user, groupnames);

      if (!isAuthorized) {
        return res.status(403).json({
          error: `User ${req.user} is not allowed to access this resource.`,
        });
      }

      next();
    } catch (error) {
      console.error("Authentication/Authorization error:", error);
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
}; */
