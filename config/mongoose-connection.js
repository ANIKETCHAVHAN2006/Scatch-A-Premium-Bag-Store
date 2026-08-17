const mongoose = require("mongoose");
const config = require("config");
const dbgr = require("debug")("development:mongoose");

const mongoURI = process.env.MONGO_URI || `${config.has("MONGODB_URI") ? config.get("MONGODB_URI") : "mongodb://127.0.0.1:27017"}/scatch-a-premium-bag-store`;

mongoose
    .connect(mongoURI)
    .then(() => {
        dbgr("Connected to MongoDB");
        console.log("Connected to MongoDB successfully");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

module.exports = mongoose.connection;