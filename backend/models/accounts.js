const connection = require("../sqlconnection");

const bcrypt = require("bcrypt");
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
    // Query to fetch user data based on username
    const sql = "SELECT * FROM user WHERE username = ?;";
    const results = await query(sql, [user.username]);

    if (results.length === 0) {
      return {
        success: false,
        message: "No user found with the provided username",
      };
    }

    const encryptedPassword = results[0].password;

    // Compare passwords using bcrypt
    if (await bcrypt.compare(user.password, encryptedPassword)) {
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

module.exports = {
  getAllAccounts,
  createAccount,
  login,
};
