const connection = require("../sqlconnection");

const bcrypt = require("bcryptjs");
const saltRounds = 10;

const util = require("util");

const generateAccessToken = require("../utils/generateAccessToken.js");

// Promisify the query method
const query = util.promisify(connection.query).bind(connection);

//Get All Account Details
async function getAllAccounts() {
  try {
    const results = await query("SELECT * FROM user;");
    return results;
  } catch (error) {
    throw error;
  }
}
//Register User
async function createAccount(newUser) {
  try {
    const encryptedPassword = await bcrypt.hash(newUser.password, saltRounds);
    const sql =
      "INSERT INTO user (username, password, email, disabled) VALUES (?,?,?,?);";
    const values = [newUser.username, encryptedPassword, newUser.email, false];

    const results = await query(sql, values);
    return results;
  } catch (error) {
    throw error;
  }
}

//Login
async function login(user) {
  try {
    const sql = `
    SELECT * FROM user WHERE username = ?;
    `;
    const results = await query(sql, [user.username]);

    if (results.length === 0) {
      return {
        success: false,
        message: "No user found with the provided username",
      };
    }

    const userData = results[0];

    // Check if the user is disabled
    if (userData.disabled) {
      return {
        success: false,
        message: "User account is disabled",
      };
    }

    // Compare passwords using bcryptjs
    const isPasswordMatch = await bcrypt.compare(
      user.password,
      userData.password
    );

    if (isPasswordMatch) {
      // Passwords match, generate access token
      const accessToken = generateAccessToken({ user: user.username });
      return { success: true, accessToken };
    } else {
      // Passwords do not match
      return { success: false, message: "Incorrect password" };
    }
  } catch (error) {
    throw error;
  }
}

/*async function findByUserName(username) {
  try {
    console.log(username);
    const sql = `SELECT groupname
    FROM usergroup
    WHERE userID = ?;`;
    const results = await query(sql, [username]);
    return results[0].groupname; //return groupname as a string
  } catch (error) {
    throw error;
  }
} */

async function Checkgroup(userid, groupname) {
  const sql = `
    SELECT COUNT(*) AS count
    FROM usergroup
    WHERE userID = ? AND groupname IN (?);
  `;

  try {
    const [result] = await query(sql, [userid, groupname]);
    return result.count > 0; // Return true if the count is greater than 0 (user belongs to group), false otherwise
  } catch (error) {
    console.error("Error checking user group:", error);
    throw error;
  }
}

module.exports = {
  getAllAccounts,
  createAccount,
  login,
  //findByUserName,
  Checkgroup,
};

//check to convert everythig to lowercase since all data in be shoukd be lowercase

// Passwords match, now check group access
/*const sqlGroups = "SELECT group_name FROM grouptable;";
      const groupResults = await query(sqlGroups);
      const allowedGroups = groupResults.map((row) => row.group_name);
      let groupAccess = false;

      for (let group of allowedGroups) {
        if (userData.groupname === group) {
          groupAccess = true;
          console.log("I am in " + userData.groupname);
          break;
        }
      }

      if (!groupAccess) {
        return {
          success: false,
          message: "User does not have access to log in",
        };
      } */
