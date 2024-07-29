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
    const results = await query(
      `SELECT u.username, u.email, u.password, u.disabled, GROUP_CONCAT(ug.groupname) AS groupname, GROUP_CONCAT(ug.id) AS id
      FROM user u
      JOIN usergroup ug ON u.username = ug.userID
      GROUP BY u.username;`
    );
    return results;
  } catch (error) {
    throw error;
  }
}

async function getAllGroups() {
  try {
    const results = await query(
      `SELECT DISTINCT groupname
      FROM usergroup;`
    );
    return results;
  } catch (error) {
    throw error;
  }
}

//Edit user
async function editUser(user) {
  try {
    console.log(user.password);
    const encryptedPassword = await bcrypt.hash(user.password, saltRounds);
    const results = await query(
      `UPDATE user
       SET email = ?, password = ?, disabled = ?
       WHERE username = ?;`,
      [user.email, encryptedPassword, user.disabled, user.username]
    );
    return results;
  } catch (error) {
    console.error("Error editing user:", error);
    throw error;
  }
}

//Edit Group
async function editGroup(group) {
  try {
    const results = await query(
      `UPDATE usergroup
      SET groupname = ?
WHERE id = ?;`,
      [group.groupname, group.groupid]
    );
    return results;
  } catch (error) {
    console.error("Error editing user:", error);
    throw error;
  }
}

//remove group
async function removeGroup(group) {
  try {
    const results = await query(`DELETE FROM usergroup where id = ?;`, [
      group.groupid,
    ]);
    return results;
  } catch (error) {
    console.error("Error editing user:", error);
    throw error;
  }
}

async function addGroups(group) {
  try {
    const results = await query(
      "INSERT INTO usergroup (groupname, userID) VALUES (?, ?);",
      [group.groupname, group.username]
    );
    console.log(results);
    return results;
  } catch (error) {
    console.error("Error adding group:", error);
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

async function findByUserName(username) {
  try {
    const sql = `SELECT groupname FROM usergroup WHERE userID = ?;`;
    const results = await query(sql, [username]);
    return results.map((row) => row.groupname); // Return an array of group names
  } catch (error) {
    throw error;
  }
}

module.exports = { login, findByUserName, Checkgroup };

module.exports = {
  getAllAccounts,
  getAllGroups,
  createAccount,
  login,
  findByUserName,
  Checkgroup,
  editUser,
  editGroup,
  removeGroup,
  addGroups,
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
