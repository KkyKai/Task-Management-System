const connection = require("../sqlconnection");

const bcrypt = require("bcryptjs");
const saltRounds = 10;

const util = require("util");

const generateAccessToken = require("../utils/generateAccessToken.js");


// Promisify the query method
const query = util.promisify(connection.query).bind(connection);

//Get All Account Details
/*async function getAllAccounts() {
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
} */

/*async function getAllAccounts() {
  try {
    const results = await query(
      `SELECT username, email, password, disabled
        FROM user;`
    );
    return results;
  } catch (error) {
    throw error;
  }
} */

/*async function getAllGroups() {
  try {
    const results = await query(
      `SELECT DISTINCT groupname
      FROM usergroup;`
    );
    return results;
  } catch (error) {
    throw error;
  }
} */

/*async function getGroupbyUser(username) {
  try {
    console.log(username);
    const results = await query(
      `SELECT distinct groupname FROM usergroup WHERE userID = ?;`,
      [username]
    );
    return results;
  } catch (error) {
    throw error;
  }
} */

/*async function tagGrouptoUser(username) {
  try {
    console.log(username);
    const results = await query(
      `SELECT distinct groupname FROM usergroup WHERE userID = ?;`,
      [username]
    );
    return results;
  } catch (error) {
    throw error;
  }
} */



//Edit user
/*async function editUser(user) {
  // Validation to ensure email is not blank
  if (!user.email || user.email.trim() === "") {
    throw new Error("Email cannot be blank");
  }

  try {
    const isAdminGroup = await getGroupbyUser(username);

    //Check if user is super admin
    if (user.username === "admin" && isAdminGroup.includes("admin")) {
      let sql = `UPDATE user SET email = ? WHERE username = ?`;
      let params = [user.email, user.username];
      if (user.password && user.password.trim() !== "") {
        const encryptedPassword = await bcrypt.hash(user.password, saltRounds);
        sql = `UPDATE user SET email = ?, password = ? WHERE username = ?`;
        params = [user.email, encryptedPassword, user.username];

        const results = await query(sql, params);
        return results;
      }
      throw new Error(
        "Normal admins can only edit the email and password of the super admin."
      );
    } 

    let sql = `UPDATE user SET email = ?, disabled = ? WHERE username = ?`;
    let params = [user.email, user.disabled, user.username];

    if (user.password && user.password.trim() !== "") {
      // If password is not an empty string, hash it and update the password
      const encryptedPassword = await bcrypt.hash(user.password, saltRounds);
      sql = `UPDATE user SET email = ?, password = ?, disabled = ? WHERE username = ?`;
      params = [user.email, encryptedPassword, user.disabled, user.username];
    }

    const results = await query(sql, params);
    return results;
  } catch (error) {
    console.error("Error editing user:", error);
    throw error;
  }
} */

//remove group
/*async function removeGroups(group) {
  try {
    console.log(group.groupname);
    console.log(group.userID);
    const results = await query(
      `DELETE FROM usergroup where groupname = ? AND userID = ?`,
      [group.groupname, group.userID]
    );

    return results;
  } catch (error) {
    console.error("Error editing user:", error);
    throw error;
  }
} */

/*async function addGroups(group) {
  try {
    // Check if the groupname already exists
    const [existingGroup] = await query(
      "SELECT * FROM usergroup WHERE groupname = ?;",
      [group.groupname]
    );

    if (existingGroup) {
      throw new Error("Groupname already exists.");
    }

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
} */

//Edit Group
/*async function editGroup(group) {
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
} */

//Register User
/*async function createAccount(newUser) {
  try {
    if (!newUser.username || newUser.username.trim() === "") {
      throw new Error("Username cannot be an empty string");
    }

    // Validate other fields if needed
    if (!newUser.password || newUser.password.trim() === "") {
      throw new Error("Password cannot be an empty string");
    }
    if (!newUser.email || newUser.email.trim() === "") {
      throw new Error("Email cannot be an empty string");
    }
    const encryptedPassword = await bcrypt.hash(newUser.password, saltRounds);
    const sql =
      "INSERT INTO user (username, password, email, disabled) VALUES (?,?,?,?);";
    const values = [
      newUser.username,
      encryptedPassword,
      newUser.email,
      newUser.disabled,
    ];

    const results = await query(sql, values);
    return results;
  } catch (error) {
    throw error;
  }
} */

/*async function insertUserGroup(newUser) {
  try {
    // Validate that username is not an empty string
    if (!newUser.username || newUser.username.trim() === "") {
      throw new Error("Username cannot be an empty string");
    }
    const sql = "INSERT INTO usergroup (groupname, userID) VALUES (?,?);";
    const values = [newUser.groupname, newUser.username];

    const results = await query(sql, values);
    return results;
  } catch (error) {
    throw error;
  }
} */

//Login
async function login(user, ipAddress, browserType) {
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
      const payload = {
        user: user.username,
        ip: ipAddress,
        browser: browserType,
      };
      const accessToken = generateAccessToken({ payload });
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
    console.log(result.count > 0);
    return result.count > 0; // Return true if the count is greater than 0 (user belongs to group), false otherwise
  } catch (error) {
    console.error("Error checking user group:", error);
    throw error;
  }
}

/*async function findByUserName(username) {
  try {
    const sql = `SELECT DISTINCT groupname FROM usergroup WHERE userID = ?;`;
    const results = await query(sql, [username]);
    return results.map((row) => row.groupname); // Return an array of group names
  } catch (error) {
    throw error;
  }
} */

/*async function selectByUser(username) {
  try {
    const sql = `SELECT email FROM user WHERE username = ?;`;
    const results = await query(sql, [username]);
    return results[0];
  } catch (error) {
    throw error;
  }
} */

//Edit user
/*async function editByUser(user) {
  try {
    // Validate that the email is not blank
    if (!user.email || user.email.trim() === "") {
      throw new Error("Email cannot be blank");
    }
    // Initialize SQL query and parameters
    let sql = `UPDATE user SET email = ? WHERE username = ?`;
    let params = [user.email, user.username];

    // Check if password is provided and is not an empty string
    if (user.password && user.password.trim() !== "") {
      // Hash the password
      const encryptedPassword = await bcrypt.hash(user.password, saltRounds);
      sql = `UPDATE user SET email = ?, password = ? WHERE username = ?`;
      params = [user.email, encryptedPassword, user.username];
    }

    // Execute the SQL query
    const results = await query(sql, params);
    return results;
  } catch (error) {
    console.error("Error editing user:", error);
    throw error;
  }
} */

module.exports = {
  //getAllAccounts,
  //getAllGroups,
  //createAccount,
  //login,
  //findByUserName,
  Checkgroup,
  //editUser,
  //editGroup,
  //removeGroups,
  //addGroups,
  //insertUserGroup,
  //getGroupbyUser,
  //selectByUser,
  //editByUser,
};

//check to convert everythig to lowercase since all data in be shoukd be lowercase
