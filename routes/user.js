const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js")
const userController = require("../controllers/users.js")
const User = require("../models/user")
const crypto = require("crypto");
const nodemailer = require("nodemailer");

router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup))

router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true}), wrapAsync(userController.login))

// Render Forgot Password Page
router
    .get("/forgotPassword", (req, res) => {
    res.render("users/forgotPassword");
});

// Handle Forgot Password Logic
router.post("/forgotPassword", userController.forgotPassword);    

// Render OTP Form
router.get("/verifyOTP", (req, res) => {
    const { email } = req.query;

    if (!email) {
        req.flash("error", "Email is required.");
        return res.redirect("/forgotPassword");
    }

    res.render("users/verifyOTP", { email });
});

router.post("/verifyOTP", userController.verifyOTP);

// Logout
router.get("/logout", userController.logout)

module.exports = router
