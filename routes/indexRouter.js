const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

const userModel = require("../models/user-model");
const productModel = require("../models/product-model");
const isLoggedIn = require("../middleware/isLoggedIn");

// Helper to safely extract logged in user from cookie without forcing redirect
const getLoggedInUser = async (req) => {
    try {
        const token = req.cookies.token;
        if (!token) return null;
        const decoded = jwt.verify(token, keys.jwtKey || process.env.JWT_KEY);
        return await userModel.findOne({ email: decoded.email }).select("-password");
    } catch {
        return null;
    }
};

// Home Landing Page
router.get("/", async (req, res) => {
    const user = await getLoggedInUser(req);
    res.render("index", { user });
});

// Login Page
router.get("/login", async (req, res) => {
    const user = await getLoggedInUser(req);
    if (user) return res.redirect("/shop");
    res.render("login");
});

// Register Page
router.get("/register", async (req, res) => {
    const user = await getLoggedInUser(req);
    if (user) return res.redirect("/shop");
    res.render("register");
});

// Shop Page
router.get("/shop", async (req, res) => {
    try {
        const products = await productModel.find();
        const user = await getLoggedInUser(req);
        const success = req.flash("success");
        const error = req.flash("error");

        res.render("shop", {
            products,
            user,
            success,
            error
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Add to Cart Route
router.get("/addtocart/:id", isLoggedIn, async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) {
            req.flash("error", "Product not found.");
            return res.redirect("/shop");
        }

        const user = await userModel.findOne({ email: req.user.email });
        user.cart.push(req.params.id);
        await user.save();

        req.flash("success", `"${product.name}" added to cart!`);
        res.redirect("/shop");
    } catch (error) {
        req.flash("error", error.message || "Could not add item to cart.");
        res.redirect("/shop");
    }
});

// Remove from Cart Route
router.get("/removefromcart/:id", isLoggedIn, async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        
        // Remove first occurrence of product ID from cart
        const index = user.cart.indexOf(req.params.id);
        if (index > -1) {
            user.cart.splice(index, 1);
            await user.save();
            req.flash("success", "Item removed from cart.");
        } else {
            req.flash("error", "Item not found in your cart.");
        }

        res.redirect("/cart");
    } catch (error) {
        req.flash("error", error.message || "Failed to remove item.");
        res.redirect("/cart");
    }
});

// Cart Page
router.get("/cart", isLoggedIn, async (req, res) => {
    try {
        const user = await userModel
            .findOne({ email: req.user.email })
            .populate("cart");

        // Filter out null values in case products were deleted
        user.cart = user.cart.filter(item => item !== null && item !== undefined);

        // Bill Calculations
        let totalMRP = 0;
        let totalDiscount = 0;

        user.cart.forEach(item => {
            totalMRP += Number(item.price) || 0;
            totalDiscount += Number(item.discount) || 0;
        });

        const platformFee = user.cart.length > 0 ? 20 : 0;
        const shippingFee = user.cart.length > 0 ? (totalMRP > 2000 ? 0 : 50) : 0;
        const finalAmount = Math.max(0, totalMRP - totalDiscount + platformFee + shippingFee);

        const billDetails = {
            totalMRP,
            totalDiscount,
            platformFee,
            shippingFee,
            finalAmount
        };

        const success = req.flash("success");
        const error = req.flash("error");

        res.render("cart", {
            user,
            billDetails,
            success,
            error
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;