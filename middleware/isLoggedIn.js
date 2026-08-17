const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const userModel = require("../models/user-model");

const isLoggedIn = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            req.flash("error", "You need to log in first.");
            return res.redirect("/login");
        }

        const jwtSecret = keys.jwtKey || process.env.JWT_KEY || "scatch_jwt_secret_key_2026";
        const decoded = jwt.verify(token, jwtSecret);

        const user = await userModel.findOne({ email: decoded.email }).select("-password");

        if (!user) {
            res.clearCookie("token");
            req.flash("error", "User account not found. Please log in again.");
            return res.redirect("/login");
        }

        if (!user.cart) {
            user.cart = [];
        }

        req.user = user;
        next();

    } catch (error) {
        res.clearCookie("token");
        req.flash("error", "Something went wrong. Please log in again.");
        return res.redirect("/login");
    }
};

module.exports = isLoggedIn;