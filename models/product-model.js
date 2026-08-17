const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: String,

    price: Number,

    discount: {
        type: Number,
        default: 0
    },

    bgcolor: String,

    panelcolor: String,

    textcolor: String,

    image: Buffer
});

module.exports = mongoose.model("product", productSchema);