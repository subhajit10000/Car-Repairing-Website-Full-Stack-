import crypto from "crypto";
import bcrypt from "bcryptjs";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 10);
const OTP_RESEND_COOLDOWN_SECONDS = Number(
    process.env.OTP_RESEND_COOLDOWN_SECONDS || 45
);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);

// Cryptographically random 6-digit code, zero-padded.
const generateOtp = () => {
    const max = 10 ** OTP_LENGTH;
    const num = crypto.randomInt(0, max);
    return String(num).padStart(OTP_LENGTH, "0");
};

const hashOtp = async (otp) => bcrypt.hash(otp, 10);
const compareOtp = async (otp, hash) => bcrypt.compare(otp, hash || "");

const otpExpiryDate = () =>
    new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

export default {
    OTP_LENGTH,
    OTP_EXPIRY_MINUTES,
    OTP_RESEND_COOLDOWN_SECONDS,
    OTP_MAX_ATTEMPTS,
    generateOtp,
    hashOtp,
    compareOtp,
    otpExpiryDate,
};
