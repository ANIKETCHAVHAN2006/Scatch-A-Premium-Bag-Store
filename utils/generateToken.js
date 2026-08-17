const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

const generateToken = (user) => {
    const secret = keys.jwtKey || process.env.JWT_KEY || "scatch_jwt_secret_key_2026";
    return jwt.sign(
        {
            email: user.email,
            id: user._id
        },
        secret
    );
};

module.exports = generateToken;