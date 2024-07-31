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

async function getAllGroups(req, res) {
  try {
    const results = await accountModel.getAllGroups();
    console.log(results);
    res.json(results);
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).send("Error querying database");
  }
}

async function getGroupbyUsers(req, res) {
  console.log(req.params.username);
  try {
    const results = await accountModel.getGroupbyUser(req.params.username);
    console.log(results);
    res.json(results);
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).send("Error querying database");
  }
}

//update user
//get all accounts => /updateUser
async function updateUser(req, res) {
  const username = req.params.username; // Extract username from URL
  const userData = { ...req.body, username }; // Combine username with req.body

  console.log(userData);

  try {
    const results = await accountModel.editUser(userData);
    console.log(results);
    res.json(results);
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).send("Error querying database");
  }
}

//update group
//Update Group => /updateUser
async function updateGroup(req, res) {
  const groupid = req.params.id; // Extract username from URL
  const groupData = { ...req.body, groupid }; // Combine username with req.body
  console.log(groupData);

  try {
    const results = await accountModel.editGroup(groupData);
    console.log(results);
    res.json(results);
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).send("Error querying database");
  }
}

async function removeGroup(req, res) {
  const groupData = req.body;
  console.log(groupData);

  try {
    const results = await accountModel.removeGroups(groupData);
    console.log(results);
    res.json(results);
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).send("Error querying database");
  }
}

async function addGroup(req, res) {
  try {
    const results = await accountModel.addGroups(req.body);
    console.log(req.body);
    res.json(results);
  } catch (error) {
    console.error("Error sending to database:", error);
    res.status(500).send("Error sending to database");
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

async function createUserGroup(req, res) {
  try {
    const results = await accountModel.insertUserGroup(req.body);
    console.log(results);
    res.json(results);
  } catch (error) {
    console.error("Error sending to database:", error);
    res.status(500).send("Error sending to database");
  }
}

// Login User
// Login User => /login
async function login(req, res) {
  try {
    const ipAddress =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const browserType = req.headers["user-agent"];

    const loggedInUser = await accountModel.login(
      req.body,
      ipAddress,
      browserType
    );

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
      //console.log(req.body.username);
      //console.log(req.body.password);

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

async function logout(req, res) {
  try {
    // Clear the JWT cookie
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

async function getUserInfo(req, res) {
  try {
    console.log(req.user);
    const user = req.user;
    res.json({ success: true, user });
    console.log("I am " + user);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

/*async function selectByUsers(req, res) {
  console.log(req.params.user);
  try {
    const results = await accountModel.selectByUser(req.params.user);
    console.log(results);
    res.json(results);
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).send("Error querying database");
  }
} */

async function selectByUsers(req, res) {
  console.log(req.user);
  try {
    // if authenticated user === user in param from context
    if (req.user === req.params.user) {
      const results = await accountModel.selectByUser(req.user);
      console.log(results);
      res.json(results);
    } else {
      res.status(500).send("Unauthorised User");
    }
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).send("Error querying database");
  }
}

async function updateSelectedUser(req, res) {
  try {
    const username = req.params.username; // Extract username from URL
    // if authenticated user === user in param from context
    if (username === req.user) {
      const userData = { ...req.body, username }; // Combine username with req.body
      const results = await accountModel.editByUser(userData);
      console.log(results);
      res.json(results);
    } else {
      res.status(500).send("Unauthorised User");
    }
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).send("Error querying database");
  }
}

module.exports = {
  getAllAccounts,
  createAccount,
  login,
  logout,
  getUserInfo,
  updateUser,
  updateGroup,
  getAllGroups,
  removeGroup,
  addGroup,
  createUserGroup,
  getGroupbyUsers,
  selectByUsers,
  updateSelectedUser,
};

//credentials: true for cookies
