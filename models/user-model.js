const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        trim: true
    },

    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String
    },

    cart: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        }
    ]
});

module.exports = mongoose.model("user", userSchema);