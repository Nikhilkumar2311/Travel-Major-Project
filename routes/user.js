const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs")
})

router.post("/signup", wrapAsync(async(req, res) => {
    try{
        let {username, email, password} = req.body
        const newUser = new User({email, username})
        await User.register(newUser, password)
        req.flash("success", "Welcome to VoyageVista!!")
        res.redirect("/listings")
    } catch(e){
        req.flash("error", e.message)
        res.redirect("/signup")
    }
}))

router.get("/login", (req, res) => {
    res.render("users/login.ejs")
})

router.post("/login", passport.authenticate("local", { failureRedirect: '/login', failureFlash: true}), wrapAsync(async(req, res) => {
    req.flash("success", "Welcome back to VoyageVista!")
    res.redirect("/listings")
}))

module.exports = router
