require("dotenv").config();

module.exports = {
    jwtKey: process.env.JWT_KEY || "scatch_jwt_secret_key_2026"
};