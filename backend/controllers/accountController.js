const connection = require("../sqlconnection");

const bcrypt = require("bcryptjs");
const saltRounds = 10;

const jwt = require("jsonwebtoken");

const { Checkgroup } = require('../models/accounts.js'); // Adjust the path as needed

//get All Account
//get all accounts => /getAllAccounts
async function getAllAccounts(req, res) {
  try {
    connection.query(
      `SELECT username, email, password, disabled FROM user where username <> '-';`,
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
  const username = req.body.username;
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
        params = [userData.email.toLowerCase(), encryptedPassword, userData.username.toLowerCase()];
      } else {
        sql = `UPDATE user SET email = ?, password = ?, disabled = ? WHERE username = ?`;
        params = [
          userData.email.toLowerCase(),
          encryptedPassword,
          userData.disabled,
          userData.username.toLowerCase(),
        ];
      }
    } else {
      if (userData.username === "admin") {
        //console.log("I am an admin" + userData.username);
        userData.disabled = false;
        sql = `UPDATE user SET email = ? WHERE username = ?`;
        params = [userData.email.toLowerCase(), userData.username.toLowerCase()];
      } else {
        sql = `UPDATE user SET email = ?, disabled = ? WHERE username = ?`;
        params = [userData.email.toLowerCase(), userData.disabled, userData.username.toLowerCase()];
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

async function removeGroup(req, res) {
  const groupData = req.body; // Extract group data from the request body

  console.log(groupData);

  // Validate group data
  if (!groupData.groupname || !groupData.userID) {
    return res.status(400).json({message: "Group name and username are required"});
  }

  if (groupData.userID === "admin") {
    return res.status(403).json({message: "Cannot remove group for user 'admin'"});
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
  console.log(groupData.username);

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
          [groupData.groupname.toLowerCase(), groupData.username.toLowerCase()],
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

  console.log("in create " + newUser.username);

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
      newUser.username.toLowerCase(),
      encryptedPassword,
      newUser.email.toLowerCase(),
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
  console.log(newUser.user);
  console.log(newUser.groupname);
  console.log(newUser.username);

  // Validate user group data
  if (!newUser.username || newUser.username.trim() === "") {
    return res.status(400).json({message: "Username cannot be an empty string"});
  }
  if (!newUser.groupname || newUser.groupname.trim() === "") {
    return res.status(400).json({message: "Group name cannot be an empty string"});
  }

  if (newUser.username === "admin") {
    console.log("i am addgroup user" + newUser.username);
    return res.status(403).json({message: "Cannot add group for user 'admin'"});
  }

  try {
    // SQL query to insert user group
    const sql = "INSERT INTO usergroup (groupname, userID) VALUES (?, ?);";
    const values = [newUser.groupname.toLowerCase(), newUser.username.toLowerCase()];

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

async function selectByUsers(req, res) {
  console.log("In selectbyUsers " + req.body.user);

  // Extract username from the request parameters
  const username = req.body.user;

  try {
    // if authenticated user === user in param from context
    if (req.user === username) {
      // SQL query to fetch email based on username
      const sql = "SELECT email FROM user WHERE username = ?;";

      // Perform the query
      const results = await connection
        .promise()
        .query(sql, [username]);

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
    const username = req.body.user; // Extract username from URL
    const authenticatedUser = req.user;
    // Combine username with req.body

    // if authenticated user === user in param from context
    if (username === authenticatedUser) {
      const userData = { ...req.body, username: username };
      // Validate that the email is not blank
      if (!userData.email || userData.email.trim() === "") {
        return res.status(400).send("Email cannot be blank");
      }

      // Initialize SQL query and parameters
      let sql = `UPDATE user SET email = ? WHERE username = ?`;
      let params = [userData.email.toLowerCase(), userData.username.toLowerCase()];

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
        params = [userData.email.toLowerCase(), encryptedPassword, userData.username.toLowerCase()];
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

// Route /status
/*const checkAuthStatus = (req, res) => {
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
}; */

const checkAuthStatus = (req, res) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ isAuthenticated: false, user: null });
  }

  return res.json({ isAuthenticated: true, user: req.user });
};

const checkAuth = async (req, res) => {
  try {
    console.log("req.user ", req.user);
    const isAdmin = await Checkgroup(req.user, "admin");
    res.json({ isAuthenticated: isAdmin });
  } catch (error) {
    console.error("Error checking user group:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

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

module.exports = {
  getAllAccounts,
  createAccount,
  updateUser,
  getAllGroups,
  removeGroup,
  addGroup,
  createUserGroup,
  getGroupbyUsers,
  selectByUsers,
  updateSelectedUser,
  getUserStatus,
  checkAuthStatus,
  checkAuth
};

//check to convert everythig to lowercase since all data in be shoukd be lowercase