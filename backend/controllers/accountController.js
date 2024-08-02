const accountModel = require("../models/accounts");

const connection = require("../sqlconnection");

const bcrypt = require("bcryptjs");
const saltRounds = 10;

const util = require("util");

const generateAccessToken = require("../utils/generateAccessToken.js");

const jwt = require("jsonwebtoken");

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
  const username = req.query.username;
  console.log("I am in controller " + username);

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

async function updateUser(req, res) {
  const userData = req.body;

  console.log("updateUser " + userData.disabled);

  // Validate user data
  if (!userData.email || userData.email.trim() === "") {
    return res.status(400).send("Email cannot be blank");
  }

  try {
    let sql, params;

    // Validate and hash password if provided
    if (userData.password && userData.password.trim() !== "") {
      if (userData.password.length < 8 || userData.password.length > 10) {
        return res
          .status(400)
          .send("Password length must be between 8 and 10 characters");
      }
      if (
        !/[a-zA-Z]/.test(userData.password) ||
        !/\d/.test(userData.password) ||
        !/[!@#$%^&*(),.?":{}|<>]/.test(userData.password)
      ) {
        return res
          .status(400)
          .send(
            "Password must contain alphanumeric characters and at least one special character"
          );
      }

      const encryptedPassword = await bcrypt.hash(
        userData.password,
        saltRounds
      );

      if (userData.username === "admin") {
        //console.log("I am an admin" + userData.username);
        userData.disabled = false;
        sql = `UPDATE user SET email = ?, password = ? WHERE username = ?`;
        params = [userData.email, encryptedPassword, userData.username];
      } else {
        sql = `UPDATE user SET email = ?, password = ?, disabled = ? WHERE username = ?`;
        params = [
          userData.email,
          encryptedPassword,
          userData.disabled,
          userData.username,
        ];
      }
    } else {
      if (userData.username === "admin") {
        //console.log("I am an admin" + userData.username);
        userData.disabled = false;
        sql = `UPDATE user SET email = ? WHERE username = ?`;
        params = [userData.email, userData.username];
      } else {
        sql = `UPDATE user SET email = ?, disabled = ? WHERE username = ?`;
        params = [userData.email, userData.disabled, userData.username];
      }
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

async function getUserStatus(req, res) {
  const username = req.params.username;
  console.log(username);

  try {
    connection.query(
      `SELECT disabled FROM user WHERE username = ?;`,
      [username],
      (error, results) => {
        if (error) {
          console.error("Error querying database:", error);
          res.status(500).send("Error querying database");
        } else {
          console.log(results[0]);
          res.json(results[0]);
        }
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send("Unexpected error");
  }
}

async function removeGroup(req, res) {
  const groupData = req.body; // Extract group data from the request body

  console.log(groupData);

  // Validate group data
  if (!groupData.groupname || !groupData.userID) {
    return res.status(400).send("Group name and username are required");
  }

  if (groupData.userID === "admin") {
    return res.status(403).send("Cannot remove group for user 'admin'");
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

async function createAccount(req, res) {
  const newUser = req.body; // Extract new user data from request body

  console.log(newUser);

  // Validate user data
  if (!newUser.username || newUser.username.trim() === "") {
    return res.status(400).send("Username cannot be an empty string");
  }
  if (newUser.username.length < 4 || newUser.username.length > 20) {
    console.log(newUser.username);
    return res
      .status(400)
      .send("Username length must be between 4 and 20 characters");
  }
  if (!newUser.password || newUser.password.trim() === "") {
    console.log(newUser.password);
    return res.status(400).send("Password cannot be an empty string");
  }
  if (newUser.password.length < 8 || newUser.password.length > 10) {
    console.log(newUser.password);
    return res
      .status(400)
      .send("Password length must be between 8 and 10 characters");
  }
  if (
    !/[a-zA-Z]/.test(newUser.password) ||
    !/\d/.test(newUser.password) ||
    !/[!@#$%^&*(),.?":{}|<>]/.test(newUser.password)
  ) {
    return res
      .status(400)
      .send(
        "Password must contain alphanumeric characters and at least one special character"
      );
  }
  if (!newUser.email || newUser.email.trim() === "") {
    return res.status(400).send("Email cannot be an empty string");
  }

  try {
    // Hash the password
    const encryptedPassword = await bcrypt.hash(newUser.password, saltRounds);

    // SQL query to insert new user
    const sql =
      "INSERT INTO user (username, password, email, disabled) VALUES (?, ?, ?, ?);";
    const values = [
      newUser.username,
      encryptedPassword,
      newUser.email,
      newUser.disabled,
    ];

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

  if (newUser.username === "admin") {
    console.log("i am addgroup user" + newUser.username);
    return res.status(403).send("Cannot add group for user 'admin'");
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

async function login(req, res) {
  const ipAddress =
    req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const browserType = req.headers["user-agent"];

  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    // Query to find the user
    const sql = "SELECT * FROM user WHERE username = ?;";
    const [results] = await connection.promise().query(sql, [username]);

    if (results.length === 0) {
      return res.status(401).json({ error: "Incorrect Username or Password" });
    }

    const userData = results[0];
    console.log(username);

    // Check if the user is disabled
    if (userData.disabled) {
      return res.status(401).json({ error: "Incorrect Username or Password" });
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
      const accessToken = generateAccessToken({ payload });

      // Set the access token in a cookie
      res.cookie("jwt", accessToken, {
        httpOnly: true, // Ensures the cookie is only accessible via HTTP(S) and not JavaScript
        expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
        ),
        secure: true, // Ensures the cookie is only sent over HTTPS
        sameSite: "None", // Ensures the cookie is sent only for same-site requests
      });

      console.log(accessToken);
      res.json({ message: `${username} is logged in!` });
    } else {
      res.clearCookie("jwt");
      res.status(401).json({ error: "Incorrect Username or Password" });
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

async function selectByUsers(req, res) {
  console.log(req.user);

  // Extract username from the request parameters
  const usernameFromParams = req.params.username;

  try {
    // if authenticated user === user in param from context
    if (req.user === usernameFromParams) {
      // SQL query to fetch email based on username
      const sql = "SELECT email FROM user WHERE username = ?;";

      // Perform the query
      const results = await connection
        .promise()
        .query(sql, [usernameFromParams]);

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
        if (userData.password.length < 8 || userData.password.length > 10) {
          return res
            .status(400)
            .send("Password length must be between 8 and 10 characters");
        }
        if (
          !/[a-zA-Z]/.test(userData.password) ||
          !/\d/.test(userData.password) ||
          !/[!@#$%^&*(),.?":{}|<>]/.test(userData.password)
        ) {
          return res
            .status(400)
            .send(
              "Password must contain alphanumeric characters and at least one special character"
            );
        }

        // Hash the password
        const encryptedPassword = await bcrypt.hash(
          userData.password,
          saltRounds
        );
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

const checkAuthStatus = (req, res) => {
  console.log("Received token:", req.cookies); // Log received token
  const token = req.cookies.jwt;
  console.log("Received token:", token); // Log received token

  if (!token) {
    return res.status(401).json({ isAuthenticated: false, user: null });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification error:", err); // Log verification error

      return res.status(403).json({ isAuthenticated: false, user: null });
    }

    console.log("User from token:", user.payload.user); // Log decoded user
    res.json({ isAuthenticated: true, user: user.payload.user });
  });
};

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
  getUserStatus,
  checkAuthStatus,
};
