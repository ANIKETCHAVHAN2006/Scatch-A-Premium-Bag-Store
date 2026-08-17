const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

const isOwner = (req, res, next) => {
    try {
        const token = req.cookies.token;

        // No token = not logged in
        if (!token) {
            req.flash("error", "Owner login required.");
            return res.redirect("/login");
        }

        // Verify token
        const jwtSecret = keys.jwtKey || process.env.JWT_KEY || "scatch_jwt_secret_key_2026";
        const decoded = jwt.verify(token, jwtSecret);

        // Check whether logged-in user is owner
        const ownerEmail = process.env.OWNER_EMAIL || "";
        if (
            !decoded.email ||
            !ownerEmail ||
            decoded.email.toLowerCase() !== ownerEmail.toLowerCase()
        ) {
            req.flash("error", "Access Denied. Admin privileges required.");
            return res.redirect("/shop");
        }

        // User is owner
        req.owner = decoded;

        next();

    } catch (error) {
        console.log("Owner authentication error:", error.message);
        req.flash("error", "Authentication error. Please log in again.");
        return res.redirect("/login");
    }
};

module.exports = isOwner;