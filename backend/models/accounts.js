const connection = require("../sqlconnection");

const util = require("util");

// Promisify the query method
const query = util.promisify(connection.query).bind(connection);

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

module.exports = {
  Checkgroup,
};