const connection = require("../sqlconnection");

const util = require("util");

//Get All Account Details
async function getAllAccounts() {
  try {
    const results = await query("SELECT * FROM user;");
    return results;
  } catch (error) {
    throw error;
  }
}
