const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

const registerUser = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        if (!fullname || !email || !password) {
            req.flash("error", "All fields are required.");
            return res.redirect("/register");
        }

        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            req.flash("error", "Account already exists with this email. Please log in.");
            return res.redirect("/login");
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const user = await userModel.create({
            fullname,
            email,
            password: hash
        });

        const token = generateToken(user);
        res.cookie("token", token);
        req.flash("success", "Account created successfully!");
        res.redirect("/shop");

    } catch (error) {
        req.flash("error", error.message || "Registration failed.");
        res.redirect("/register");
    }
};


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            req.flash("error", "Please provide both email and password.");
            return res.redirect("/login");
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            req.flash("error", "Email or password incorrect.");
            return res.redirect("/login");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            req.flash("error", "Email or password incorrect.");
            return res.redirect("/login");
        }

        const token = generateToken(user);
        res.cookie("token", token);
        req.flash("success", "Welcome back to Scatch!");
        res.redirect("/shop");

    } catch (error) {
        req.flash("error", error.message || "Login failed.");
        res.redirect("/login");
    }
};


const logoutUser = (req, res) => {
    res.clearCookie("token");
    req.flash("success", "Logged out successfully.");
    res.redirect("/login");
};


module.exports = {
    registerUser,
    loginUser,
    logoutUser
};