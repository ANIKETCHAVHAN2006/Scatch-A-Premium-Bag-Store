const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const isOwner = require("../middleware/isOwner");
const ownerModel = require("../models/owner-model");
const userModel = require("../models/user-model");
const productModel = require("../models/product-model");

// GET Admin Dashboard for creating products
router.get("/admin", isOwner, async function(req, res) {
    try {
        const products = await productModel.find();
        res.render("admin", { products });
    } catch (err) {
        res.status(500).send("Error loading admin panel: " + err.message);
    }
});

// POST Owner creation
router.post("/create", async function(req, res) {
    try {
        let owners = await ownerModel.find();
        if (owners.length > 0) {
            req.flash("error", "An owner account already exists.");
            return res.redirect("/owners/admin");
        }

        let { fullname, email, password } = req.body;

        if (!fullname || !email || !password) {
            req.flash("error", "All fields are required to create an owner account.");
            return res.redirect("/owners/admin");
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await ownerModel.create({
            fullname,
            email,
            password: hash,
        });

        // Sync with userModel if user doesn't already exist so owner can log in
        const existingUser = await userModel.findOne({ email });
        if (!existingUser) {
            await userModel.create({
                fullname,
                email,
                password: hash
            });
        }

        req.flash("success", "Owner account created successfully!");
        res.redirect("/owners/admin");
    } catch (err) {
        req.flash("error", err.message || "Failed to create owner.");
        res.redirect("/owners/admin");
    }
});

router.get("/", function(req, res) {
    res.redirect("/owners/admin");
});

module.exports = router;