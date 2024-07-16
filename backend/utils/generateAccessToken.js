const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.JWT_EXPIRE_TIME});
}

module.exports=generateAccessToken