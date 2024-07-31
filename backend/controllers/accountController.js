const accountModel = require("../models/accounts");

const connection = require("../sqlconnection");

const bcrypt = require("bcryptjs");
const saltRounds = 10;

const util = require("util");

const generateAccessToken = require("../utils/generateAccessToken.js");

//get All Account
//get all accounts => /getAllAccounts
  async function getAllAccounts(req, res) {
    try {
      connection.query(
        `SELECT username, email, password, disabled FROM user;`,
        (error, results) => {
          if (error) {
            console.error("Error querying database:", error);
            res.status(500).send("Error querying database");
          } else {
            console.log(results);
            res.json(results);
          }
        }
      );
    } catch (error) {
      console.error("Unexpected error:", error);
      res.status(500).send("Unexpected error");
    }
  }

  async function getAllGroups(req, res) {
    try {
      connection.query(
        `SELECT DISTINCT groupname FROM usergroup;`,
        (error, results) => {
          if (error) {
            console.error("Error querying database:", error);
            res.status(500).send("Error querying database");
          } else {
            console.log(results);
            res.json(results);
          }
        }
      );
    } catch (error) {
      console.error("Unexpected error:", error);
      res.status(500).send("Unexpected error");
    }
  }

  async function getGroupbyUsers(req, res) {
    const username = req.params.username;
    console.log(username);
    
    try {
      connection.query(
        `SELECT DISTINCT groupname FROM usergroup WHERE userID = ?;`,
        [username],
        (error, results) => {
          if (error) {
            console.error("Error querying database:", error);
            res.status(500).send("Error querying database");
          } else {
            console.log(results);
            res.json(results);
          }
        }
      );
    } catch (error) {
      console.error("Unexpected error:", error);
      res.status(500).send("Unexpected error");
    }
  }

//update user
//get all accounts => /updateUser
/*async function updateUser(req, res) {
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
} */

  async function updateUser(req, res) {
    const username = req.params.username; // Extract username from URL
    const userData = { ...req.body, username }; // Combine username with req.body
  
    console.log(userData);
  
    // Validate user data
    if (!userData.email || userData.email.trim() === "") {
      return res.status(400).send("Email cannot be blank");
    }
  
    try {
      let sql = `UPDATE user SET email = ?, disabled = ? WHERE username = ?`;
      let params = [userData.email, userData.disabled, userData.username];
  
      if (userData.password && userData.password.trim() !== "") {
        // If password is not an empty string, hash it and update the password
        const encryptedPassword = await bcrypt.hash(userData.password, saltRounds);
        sql = `UPDATE user SET email = ?, password = ?, disabled = ? WHERE username = ?`;
        params = [userData.email, encryptedPassword, userData.disabled, userData.username];
      }
  
      // Perform the update query
      connection.query(sql, params, (error, results) => {
        if (error) {
          console.error("Error querying database:", error);
          return res.status(500).send("Error querying database");
        }
        console.log(results);
        res.json(results);
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      res.status(500).send("Unexpected error");
    }
  }
  

//update group
//Update Group => /updateGroup
/*async function updateGroup(req, res) {
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
} */
  

/*async function removeGroup(req, res) {
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
} */

  async function removeGroup(req, res) {
    const groupData = req.body; // Extract group data from the request body
  
    console.log(groupData);
  
    // Validate group data
    if (!groupData.groupname || !groupData.userID) {
      return res.status(400).send("Group name and username are required");
    }
  
    try {
      // Perform the delete query directly within the controller function
      connection.query(
        `DELETE FROM usergroup WHERE groupname = ? AND userID = ?`,
        [groupData.groupname, groupData.userID],
        (error, results) => {
          if (error) {
            console.error("Error querying database:", error);
            return res.status(500).send("Error querying database");
          }
          console.log(results);
          res.json(results);
        }
      );
    } catch (error) {
      console.error("Unexpected error:", error);
      res.status(500).send("Unexpected error");
    }
  }

/*async function addGroup(req, res) {
  try {
    const results = await accountModel.addGroups(req.body);
    console.log(req.body);
    res.json(results);
  } catch (error) {
    console.error("Error sending to database:", error);
    res.status(500).send("Error sending to database");
  }
} */

  async function addGroup(req, res) {
    const groupData = req.body; // Extract group data from the request body
  
    console.log(groupData);
  
    // Validate group data
    if (!groupData.groupname) {
      return res.status(400).send("Group name is required");
    }
  
    try {
      // Check if the groupname already exists
      connection.query(
        "SELECT * FROM usergroup WHERE groupname = ?;",
        [groupData.groupname],
        async (error, results) => {
          if (error) {
            console.error("Error querying database:", error);
            return res.status(500).send("Error querying database");
          }
  
          if (results.length > 0) {
            return res.status(400).send("Groupname already exists.");
          }
  
          // If group does not exist, insert the new group
          connection.query(
            "INSERT INTO usergroup (groupname, userID) VALUES (?, ?);",
            [groupData.groupname, groupData.userID],
            (insertError, insertResults) => {
              if (insertError) {
                console.error("Error inserting into database:", insertError);
                return res.status(500).send("Error inserting into database");
              }
  
              console.log(insertResults);
              res.json(insertResults);
            }
          );
        }
      );
    } catch (error) {
      console.error("Unexpected error:", error);
      res.status(500).send("Unexpected error");
    }
  }

// Register User
// Register User => /createAccount
/*async function createAccount(req, res) {
  try {
    const results = await accountModel.createAccount(req.body);
    console.log(results);
    res.json(results);
  } catch (error) {
    console.error("Error sending to database:", error);
    res.status(500).send("Error sending to database");
  }
} */

  async function createAccount(req, res) {
    const newUser = req.body; // Extract new user data from request body
  
    console.log(newUser);
  
    // Validate user data
    if (!newUser.username || newUser.username.trim() === "") {
      return res.status(400).send("Username cannot be an empty string");
    }
    if (!newUser.password || newUser.password.trim() === "") {
      return res.status(400).send("Password cannot be an empty string");
    }
    if (!newUser.email || newUser.email.trim() === "") {
      return res.status(400).send("Email cannot be an empty string");
    }
  
    try {
      // Hash the password
      const encryptedPassword = await bcrypt.hash(newUser.password, saltRounds);
  
      // SQL query to insert new user
      const sql = "INSERT INTO user (username, password, email, disabled) VALUES (?, ?, ?, ?);";
      const values = [newUser.username, encryptedPassword, newUser.email, newUser.disabled];
  
      // Perform the query
      connection.query(sql, values, (error, results) => {
        if (error) {
          console.error("Error inserting into database:", error);
          return res.status(500).send("Error sending to database");
        }
        console.log(results);
        res.json(results);
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      res.status(500).send("Unexpected error");
    }
  }

/*async function createUserGroup(req, res) {
  try {
    const results = await accountModel.insertUserGroup(req.body);
    console.log(results);
    res.json(results);
  } catch (error) {
    console.error("Error sending to database:", error);
    res.status(500).send("Error sending to database");
  }
} */

  async function createUserGroup(req, res) {
    const newUser = req.body; // Extract new user group data from the request body
  
    console.log(newUser);
  
    // Validate user group data
    if (!newUser.username || newUser.username.trim() === "") {
      return res.status(400).send("Username cannot be an empty string");
    }
    if (!newUser.groupname || newUser.groupname.trim() === "") {
      return res.status(400).send("Group name cannot be an empty string");
    }
  
    try {
      // SQL query to insert user group
      const sql = "INSERT INTO usergroup (groupname, userID) VALUES (?, ?);";
      const values = [newUser.groupname, newUser.username];
  
      // Perform the query
      connection.query(sql, values, (error, results) => {
        if (error) {
          console.error("Error inserting into database:", error);
          return res.status(500).send("Error sending to database");
        }
        console.log(results);
        res.json(results);
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      res.status(500).send("Unexpected error");
    }
  }

// Login User
// Login User => /login
/*async function login(req, res) {
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
} */

  async function login(req, res) {
    const ipAddress =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const browserType = req.headers["user-agent"];
  
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
  
    try {
      // Query to find the user
      const sql = "SELECT * FROM user WHERE username = ?;";
      const [results] = await connection.promise().query(sql, [username]);
  
      if (results.length === 0) {
        return res.status(401).json({ error: "No user found with the provided username" });
      }
  
      const userData = results[0];
  
      // Check if the user is disabled
      if (userData.disabled) {
        return res.status(401).json({ error: "User account is disabled" });
      }
  
      // Compare passwords using bcrypt
      const isPasswordMatch = await bcrypt.compare(password, userData.password);
  
      if (isPasswordMatch) {
        // Passwords match, generate access token
        const payload = {
          user: username,
          ip: ipAddress,
          browser: browserType,
        };
        const accessToken = generateAccessToken(payload);
  
        // Set the access token in a cookie
        res.cookie("jwt", accessToken, {
          httpOnly: true, // Ensures the cookie is only accessible via HTTP(S) and not JavaScript
          expires: new Date(Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000),
          secure: true, // Ensures the cookie is only sent over HTTPS
          sameSite: "None", // Ensures the cookie is sent only for same-site requests
        });
  
        console.log(accessToken);
        res.json({ message: `${username} is logged in!` });
      } else {
        // Passwords do not match
        res.clearCookie("jwt");
        res.status(401).json({ error: "Incorrect password" });
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

/*async function getUserInfo(req, res) {
  try {
    console.log(req.user);
    const user = req.user;
    res.json({ success: true, user });
    console.log("I am " + user);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "Internal server error." });
  }
} */

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

/*async function selectByUsers(req, res) {
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
} */

  async function selectByUsers(req, res) {
    console.log(req.user);
  
    // Extract username from the request parameters
    const usernameFromParams = req.params.user;
  
    try {
    // if authenticated user === user in param from context
      if (req.user === usernameFromParams) {
        // SQL query to fetch email based on username
        const sql = "SELECT email FROM user WHERE username = ?;";
        
        // Perform the query
        const results = await connection.promise().query(sql, [usernameFromParams]);
  
          console.log(results[0]);
          res.json(results[0]);
      } else {
        res.status(403).send("Unauthorized User");
      }
    } catch (error) {
      console.error("Error querying database:", error);
      res.status(500).send("Error querying database");
    }
  }

/*async function updateSelectedUser(req, res) {
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
}*/

async function updateSelectedUser(req, res) {
  try {
    const usernameFromParams = req.params.username; // Extract username from URL
    const authenticatedUser = req.user;
 // Combine username with req.body

    // if authenticated user === user in param from context
    if (usernameFromParams === authenticatedUser) {
      const userData = { ...req.body, username: usernameFromParams };
      // Validate that the email is not blank
      if (!userData.email || userData.email.trim() === "") {
        return res.status(400).send("Email cannot be blank");
      }

      // Initialize SQL query and parameters
      let sql = `UPDATE user SET email = ? WHERE username = ?`;
      let params = [userData.email, userData.username];

      // Check if password is provided and is not an empty string
      if (userData.password && userData.password.trim() !== "") {
        // Hash the password
        const encryptedPassword = await bcrypt.hash(userData.password, saltRounds);
        sql = `UPDATE user SET email = ?, password = ? WHERE username = ?`;
        params = [userData.email, encryptedPassword, userData.username];
      }

      // Execute the SQL query
      const [results] = await connection.promise().query(sql, params);
      console.log(results);
      res.json(results);
    } else {
      res.status(403).send("Unauthorized User");
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
  //getUserInfo,
  updateUser,
  //updateGroup,
  getAllGroups,
  removeGroup,
  addGroup,
  createUserGroup,
  getGroupbyUsers,
  selectByUsers,
  updateSelectedUser,
};

//credentials: true for cookies
