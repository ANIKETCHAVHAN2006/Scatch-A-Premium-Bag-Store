const express = require('express');
const router = express.Router();
const ownerModel = require("../models/owner-model");
const productModel = require("../models/product-model");

// GET Admin Dashboard for creating products
router.get("/admin", async function(req, res) {
    try {
        const products = await productModel.find();
        const success = req.flash("success");
        const error = req.flash("error");
        res.render("admin", { success, error, products });
    } catch (err) {
        res.status(500).send("Error loading admin panel: " + err.message);
    }
});

// POST Owner creation
router.post("/create", async function(req, res) {
    try {
        let owners = await ownerModel.find();
        if (owners.length > 0) {
            req.flash("error", "You don't have permission to create a new owner.");
            return res.redirect("/owners/admin");
        }

        let { fullname, email, password } = req.body;

        let createdOwner = await ownerModel.create({
            fullname,
            email,
            password,
        });

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