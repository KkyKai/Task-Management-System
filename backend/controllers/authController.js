const connection = require("../sqlconnection");

const bcrypt = require("bcryptjs");

const generateAccessToken = require("../utils/generateAccessToken.js");

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



module.exports = {
  login,
  logout,
};
