const User = require("../models/user")
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs")
}

module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash("error", "Email is already in use.");
            return res.redirect("/signup");
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const newUser = new User({
            email,
            username,
            verificationToken,
            isVerified: false,
        });

        const registeredUser = await User.register(newUser, password);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        const verificationLink = `http://${req.headers.host}/listings/verify-email?token=${verificationToken}`;
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Verify your email - VoyageVista",
            html: `<p>Hi ${username},</p>
                <p>Please verify your email by clicking the link below:</p>
                <a href="${verificationLink}">Verify Email</a>`,
        };

        await transporter.sendMail(mailOptions);

        req.flash("success", "A verification email has been sent to your email address.");
        res.redirect("/login");
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs")
}

module.exports.login = async(req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.redirect("/listings");
        }

        if (!user.isVerified) {
            req.flash("error", "Please verify your email before logging in.");
            return res.redirect("/login");
        }

        req.flash("success", "Welcome back to VoyageVista!");
        const redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/login");
    }
}



module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err){
            return next(err)
        }
        req.flash("success", "You are logged out!!")
        res.redirect("/listings")
    })
}
