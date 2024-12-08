const User = require("../models/user")
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
require("dotenv").config();

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs")
}

module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Password Validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

        if (!passwordRegex.test(password)) {
            req.flash("error", "Password must be at least 8 characters long and contain a mix of lowercase, uppercase, digits, and special characters.");
            return res.redirect("/signup");
        }

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
        return res.redirect("/login");
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
        return res.redirect(redirectUrl);
    } catch (e) {
        req.flash("error", e.message);
        return res.redirect("/login");
    }
};

// Forget Password
module.exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            req.flash("error", "Email is required.");
            return res.redirect("/forgotPassword");
        }

        const user = await User.findOne({ email });
        if (!user) {
            req.flash("error", "No account found with that email address.");
            return res.redirect("/forgotPassword");
        }

        // Generate OTP and save hashed OTP in the database
        const otp = user.createResetPasswordOTP();
        await user.save({ validateBeforeSave: false });

        // Send OTP to the user's email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Password Reset OTP - VoyageVista",
            html: `<p>Hi,</p>
                <p>Your OTP for password reset is:</p>
                <h3>${otp}</h3>
                <p>This OTP is valid for 10 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>`,
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            req.flash("error", "Failed to send OTP. Please try again later.");
            return res.redirect("/forgotPassword");
        }

        req.flash("success", "An OTP has been sent to your email address.");
        return res.redirect(`/verifyOTP?email=${encodeURIComponent(email)}`);
    } catch (e) {
        req.flash("error", e.message);
        return res.redirect("/forgotPassword");
    }
};



// Verify OTP
module.exports.verifyOTP = async (req, res, next) => {
    try {
        const { email, otp, password } = req.body;

        // Ensure all required fields are provided
        if (!email || !otp || !password) {
            req.flash("error", "All fields are required.");
            return res.redirect("/verifyOTP");
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            req.flash("error", "No account found with the provided email.");
            return res.redirect("/verifyOTP");
        }

        // Hash the provided OTP to compare with the stored hashed OTP
        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

        // Check if the OTP is valid and not expired
        if (
            user.passwordResetOTP !== hashedOTP ||
            user.passwordResetOTPExpires < Date.now()
        ) {
            req.flash("error", "OTP is invalid or has expired.");
            return res.redirect("/verifyOTP");
        }

        // Reset the password
        await user.setPassword(password);
        user.passwordResetOTP = undefined;
        user.passwordResetOTPExpires = undefined;
        await user.save();

        req.flash("success", "Your password has been reset. You can now log in.");
        return res.redirect("/login");
    } catch (error) {
        console.error("Error in verifyOTP:", error);
        req.flash("error", "Something went wrong. Please try again.");
        return res.redirect("/verifyOTP");
    }
};



module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err){
            return next(err)
        }
        req.flash("success", "You are logged out!!")
        res.redirect("/listings")
    })
}
