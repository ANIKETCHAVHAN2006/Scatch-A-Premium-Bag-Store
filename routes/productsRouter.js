const express = require('express');
const router = express.Router();
const multer = require('multer');
const productModel = require("../models/product-model");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", function(req, res){
    res.redirect("/shop");
});

router.post("/create", upload.single("image"), async function(req, res) {
    try {
        const { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;

        if (!name || !price) {
            req.flash("error", "Product name and price are required.");
            return res.redirect("/owners/admin");
        }

        await productModel.create({
            image: req.file ? req.file.buffer : undefined,
            name,
            price: Number(price),
            discount: Number(discount) || 0,
            bgcolor: bgcolor || "#1e1e24",
            panelcolor: panelcolor || "#2b2b36",
            textcolor: textcolor || "#ffffff"
        });

        req.flash("success", "Product created successfully!");
        res.redirect("/owners/admin");
    } catch (error) {
        req.flash("error", error.message || "Failed to create product.");
        res.redirect("/owners/admin");
    }
});

module.exports = router;