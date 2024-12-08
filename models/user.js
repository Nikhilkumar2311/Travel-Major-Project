const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const crypto = require("crypto");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    passwordResetOTP: String,
    passwordResetOTPExpires: Date,
});

// Method to generate and hash OTP for password reset
userSchema.methods.createResetPasswordOTP = function () {
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP for secure storage
    this.passwordResetOTP = crypto.createHash('sha256').update(otp).digest('hex');
    this.passwordResetOTPExpires = Date.now() + 10 * 60 * 1000;

    return otp;
};

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
