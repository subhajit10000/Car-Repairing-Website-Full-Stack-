import ApiError from "../utils/ApiError.js";
import env from "../config/env.js";
import otpService from "../utils/otpService.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import sendEmail from "../utils/sendEmail.js";
import {
    createUser,
    findUserByEmail,
    findUserByEmailWithOTP,
    findUserById,
    updateUser,
} from "../repositories/user.repository.js";
import {
    issueTokenPair,
    rotateRefreshToken,
    revokeRefreshToken,
    revokeAllRefreshTokens,
} from "./token.service.js";
import { verifyRefreshToken } from "../utils/jwt.js";

const OTP_EXPIRY_MS = (Number(env.OTP_EXPIRY_MINUTES) || 5) * 60 * 1000;

const sanitizeUser = (user) => {
    const obj = user.toObject ? user.toObject() : user;
    delete obj.password;
    delete obj.otp;
    delete obj.otpExpiry;
    delete obj.otpPurpose;
    return obj;
};

const issueOTP = async (email, purpose) => {
    const user = await findUserByEmail(email);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const otp = otpService.generateOtp();
    const hashedOtp = await hashPassword(otp);

    await updateUser(user._id, {
        otp: hashedOtp,
        otpExpiry: Date.now() + OTP_EXPIRY_MS,
        otpPurpose: purpose,
    });

    return { message: "OTP sent successfully" };
};

const consumeOTP = async (email, otp, purpose) => {
    const user = await findUserByEmailWithOTP(email);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!user.otp || !user.otpExpiry || user.otpPurpose !== purpose) {
        throw new ApiError(400, "No OTP was requested for this action");
    }

    if (Date.now() > new Date(user.otpExpiry).getTime()) {
        throw new ApiError(400, "OTP has expired");
    }

    const isMatch = await comparePassword(otp, user.otp);
    if (!isMatch) {
        throw new ApiError(400, "Invalid OTP");
    }

    return user;
};

const registerService = async (payload) => {
    const existingUser = await findUserByEmail(payload.email);
    if (existingUser) {
        throw new ApiError(400, "A user with this email already exists");
    }


    const user = await createUser(payload);

    const tokens = await issueTokenPair(user);

    return { user: sanitizeUser(user), ...tokens };
};


const loginService = async (payload, req) => {
    const { email, password, role: requestedRole } = payload;

    const user = await findUserByEmail(email);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (requestedRole && user.role !== requestedRole) {
        throw new ApiError(403, `This account is registered as ${user.role.replaceAll("_", " ")}. Please choose the correct login option.`);
    }

    if (user.isBlocked) {
        throw new ApiError(403, "Your account is blocked.");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new ApiError(400, "Invalid password");
    }

    const tokens = await issueTokenPair(user, req);

    await updateUser(user._id, { lastLogin: new Date() });

    return { user: sanitizeUser(user), ...tokens };
};


const refreshTokenService = async (refreshToken, req) => {
    const { user, accessToken, refreshToken: newRefreshToken } =
        await rotateRefreshToken(refreshToken, req);

    return { user: sanitizeUser(user), accessToken, refreshToken: newRefreshToken };
};


const accessTokenService = async (refreshToken) => {
    if (!refreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    const decoded = await verifyRefreshToken(refreshToken);

    const user = await findUserById(decoded.id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    if (user.isBlocked) {
        throw new ApiError(403, "Your account is blocked.");
    }

    const accessToken = user.generateAccessToken();

    return { user: sanitizeUser(user), accessToken };
};


const logoutService = async (refreshToken) => {
    await revokeRefreshToken(refreshToken);
    return { message: "Logged out successfully" };
};


const logoutAllService = async (userId) => {
    await revokeAllRefreshTokens(userId);
    return { message: "Logged out from all sessions successfully" };
};


const forgotPasswordService = async (email) => {
    return issueOTP(email, "resetPassword");
};


const resetPasswordService = async (email, otp, newPassword) => {
    const user = await consumeOTP(email, otp, "resetPassword");


    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    user.otpPurpose = null;
    await user.save();

    await revokeAllRefreshTokens(user._id);

    return { message: "Password reset successfully" };
};


const verifyEmailService = async (email, otp) => {
    const user = await consumeOTP(email, otp, "verifyEmail");

    await updateUser(user._id, {
        isVerified: true,
        otp: null,
        otpExpiry: null,
        otpPurpose: null,
    });

    return { message: "Email verified successfully" };
};


const sendOTPService = async (email) => {
    return issueOTP(email, "verifyEmail");
};


const verifyOTPService = async (email, otp) => {
    const user = await consumeOTP(email, otp, "verifyEmail");

    await updateUser(user._id, { otp: null, otpExpiry: null, otpPurpose: null });

    return { message: "OTP verified successfully" };
};


const resendOTPService = async (email) => {
    return issueOTP(email, "verifyEmail");
};

export {
    registerService,
    loginService,
    refreshTokenService,
    accessTokenService,
    logoutService,
    logoutAllService,
    forgotPasswordService,
    resetPasswordService,
    verifyEmailService,
    sendOTPService,
    verifyOTPService,
    resendOTPService,
};
