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

// Forget Password Route
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
        req.flash('error', 'No account with that email address found.');
        return res.redirect('/forgotPassword.ejs');
    }
    
    // Generate reset token and set expiry
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    // Send email with reset token
    const resetUrl = `http://${req.headers.host}/reset-password/${resetToken}`;
    const message = `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
    `;
    
    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'voyagevista2311@gmail.com',
                pass: 'sojx pstn lfpn dkvj',
            },
        });

        await transporter.sendMail({
            to: user.email,
            subject: 'Password Reset Request',
            html: message,
        });
    
        req.flash('success', 'Reset password email sent!');
        res.redirect('/login');
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
    
        req.flash('error', 'Error sending email. Try again later.');
        res.redirect('/forgotPassword');
    }
});

router.get('/reset-password/:token', async (req, res) => {
    const hashedToken = crypto.createHash('pbkdf2').update(req.params.token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }, // Token must not be expired
    });
    
    if (!user) {
        req.flash('error', 'Invalid or expired token.');
        return res.redirect('/forgot-password');
    }
    
    res.render('/users/forgetPassword.ejs', { token: req.params.token });
});
    
router.post('/reset-password/:token', async (req, res) => {
    const hashedToken = crypto.createHash('pbkdf2').update(req.params.token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        req.flash('error', 'Invalid or expired token.');
        return res.redirect('/forgotPassword.ejs');
    }

    // Update password using passport-local-mongoose's setPassword method
    user.setPassword(req.body.password, async (err) => {
        if (err) {
            req.flash('error', 'Error resetting password.');
            return res.redirect('/forgotPassword');
        }

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        req.flash('success', 'Password reset successfully! You can now log in.');
        res.redirect('/login');
    });
});    

router.get("/logout", userController.logout)

module.exports = router
