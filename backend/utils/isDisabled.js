// path/to/your/middleware/file.js
const util = require("util");
const connection = require("../sqlconnection");

const query = util.promisify(connection.query).bind(connection);

async function issDisabled(req, res, next) {
  try {
    const username = req.params.username;

    console.log("in isDisabled " + username);

    if (!username) {
      return res.status(400).send("Username is required");
    }

    const results = await query(
      `SELECT disabled FROM user WHERE username = ?;`,
      [username]
    );

    if (results.length > 0) {
      const disabled = results[0].disabled;
      if (disabled) {
        res.clearCookie("jwt");
        return res.status(403).send("User is disabled");
      }
    } else {
      return res.status(404).send("User not found");
    }

    next();
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send("Unexpected error");
  }
}

module.exports = { issDisabled };
