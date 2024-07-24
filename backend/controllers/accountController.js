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
        secure: true, // Ensures the cookie is only sent over HTTPS
        sameSite: "None", // Ensures the cookie is sent only for same-site requests
      });

      console.log(loggedInUser.accessToken);
      console.log(req.body.username);
      console.log(req.body.password);

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

async function checkgroupAdmin(req, res) {
  try {
    const checkedUser = await accountModel.Checkgroup(
      req.cookie("jwt", loggedInUser.accessToken),
      "admin"
    );
  } catch (error) {}
}

async function logout(req, res) {
  try {
    // Clear the JWT cookie
    res.clearCookie("jwt");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

async function getUserInfo(req, res) {
  try {
    const user = req.user; // `req.user` is set in the `isAuthenticatedUser` middleware
    res.json({ success: true, user });
    console.log(req.user);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = {
  getAllAccounts,
  createAccount,
  login,
  logout,
  getUserInfo,
};

//credentials: true for cookies
