const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

const generateToken = (user) => {
    return jwt.sign(
        {
            email: user.email,
            id: user._id
        },
        keys.jwtKey
    );
};

module.exports = generateToken;