const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
require("dotenv").config();

// MongoDB Connection
const db = require("./config/mongoose-connection");

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    session({
        resave: false,
        saveUninitialized: false,
        secret: process.env.EXPRESS_SESSION_SECRET || "scatch_secret_key_2026"
    })
);

app.use(flash());

app.use((req, res, next) => {
    res.locals.isOwner = false;

    try {
        const token = req.cookies.token;

        if (token) {
            const jwt = require("jsonwebtoken");
            const keys = require("./config/keys");
            const jwtSecret = keys.jwtKey || process.env.JWT_KEY || "scatch_jwt_secret_key_2026";
            const decoded = jwt.verify(token, jwtSecret);

            const ownerEmail = process.env.OWNER_EMAIL || "";
            if (
                decoded.email &&
                ownerEmail &&
                decoded.email.toLowerCase() === ownerEmail.toLowerCase()
            ) {
                res.locals.isOwner = true;
            }
        }
    } catch (error) {
        res.locals.isOwner = false;
    }

    next();
});

// Pass flash messages to all views
app.use((req, res, next) => {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// Static files
app.use(express.static(path.join(__dirname, "public")));

// EJS View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
const ownersRouter = require("./routes/ownersRouter");
const usersRouter = require("./routes/userRouter");
const productsRouter = require("./routes/productsRouter");
const indexRouter = require("./routes/indexRouter");

app.use("/owners", ownersRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/", indexRouter);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});