const accountModel = require("../models/accounts");

//get All Account
//get all accounts => /getAllAccounts
async function getAllAccounts(req, res) {
  try {
    const results = await accountModel.getAllAccounts();
    console.log(results);
    res.json(results);
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).send("Error querying database");
  }
}

// Register User
// Register User => /createAccount
async function createAccount(req, res) {
  try {
    const results = await accountModel.createAccount(req.body);
    console.log(results);
    res.json(results);
  } catch (error) {
    console.error("Error sending to database:", error);
    res.status(500).send("Error sending to database");
  }
}

// Login User
// Register User => /login
async function login(req, res) {
  try {
    const loggedInUser = await accountModel.login(req.body);

    if (loggedInUser.success) {
      // Set the access token in a cookie
      res.cookie("jwt", loggedInUser.accessToken, {
        httpOnly: true, // Ensures the cookie is only accessible via HTTP(S) and not JavaScript
        expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
        ),
      });

      console.log(loggedInUser.accessToken);
      res.json({
        message: `${req.body.username} is logged in!`,
      });
    } else {
      res.clearCookie("jwt");
      res.status(401).json({ error: loggedInUser.message });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = {
  getAllAccounts,
  createAccount,
  login,
};
