
import {
  accessTokenService,
  sendOTPService,
  resendOTPService,
  verifyOTPService,
  loginService,
  refreshTokenService,
  logoutService,
  logoutAllService,
  forgotPasswordService,
  resetPasswordService,
  verifyEmailService,
} from "../services/auth.service.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import sendResponse from "../helpers/response.js";
import User from "../models/user.model.js";
import { sendOtpEmail } from "../config/mailer.js";
import otpService from "../utils/otpService.js";

// =========================================================
// COOKIE OPTIONS
// =========================================================

const isProduction = process.env.NODE_ENV === "production";

const accessTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// =========================================================
// OTP
// =========================================================

const issueAndSendOtp = async (user) => {
  const otp = otpService.generateOtp();

  user.otp = await otpService.hashOtp(otp);
  user.otpExpiry = otpService.otpExpiryDate();
  user.otpPurpose = "verifyEmail";

  await user.save();

  await sendOtpEmail({
    to: user.email,
    name: user.firstName,
    otp,
    expiryMinutes: otpService.OTP_EXPIRY_MINUTES,
  });
};

// =========================================================
// REGISTER
// =========================================================

const register = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
    } = req.body;

    const userData = (user) => ({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });

    let user = await User.findOne({ email });

    // Existing user
    if (user) {
      // Already verified
      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      // Existing but not verified
      await issueAndSendOtp(user);

      return res.status(200).json({
        success: true,
        message:
          "A new verification code has been sent to your email.",
        data: userData(user),
      });
    }

    // Create user
    user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      isVerified: false,
    });

    await issueAndSendOtp(user);

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. A verification code has been sent to your email.",
      data: userData(user),
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// LOGIN
// =========================================================

const login = asyncHandler(async (req, res) => {
  const {
    user,
    accessToken,
    refreshToken,
  } = await loginService(req.body, req);

  // =======================================================
  // SET AUTH COOKIES
  // =======================================================

  res.cookie(
    "accessToken",
    accessToken,
    accessTokenCookieOptions
  );

  res.cookie(
    "refreshToken",
    refreshToken,
    refreshTokenCookieOptions
  );

  return sendResponse(
    res,
    200,
    "User login successfully",
    {
      user,
      accessToken,
    }
  );
});

// =========================================================
// REFRESH TOKEN
// =========================================================

const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken;

  const {
    user,
    accessToken,
    refreshToken: newRefreshToken,
  } = await refreshTokenService(
    incomingRefreshToken,
    req
  );

  // Replace old cookies
  res.cookie(
    "accessToken",
    accessToken,
    accessTokenCookieOptions
  );

  res.cookie(
    "refreshToken",
    newRefreshToken,
    refreshTokenCookieOptions
  );

  return sendResponse(
    res,
    200,
    "Token Refreshed Successfully",
    {
      user,
      accessToken,
    }
  );
});

// =========================================================
// GET ACCESS TOKEN
// =========================================================

const accessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken;

  const {
    user,
    accessToken: newAccessToken,
  } = await accessTokenService(
    incomingRefreshToken
  );

  res.cookie(
    "accessToken",
    newAccessToken,
    accessTokenCookieOptions
  );

  return sendResponse(
    res,
    200,
    "AccessToken sent Successfully",
    {
      user,
      accessToken: newAccessToken,
    }
  );
});

// =========================================================
// LOGOUT
// =========================================================

const logout = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken;

  await logoutService(incomingRefreshToken);

  // Clear cookies
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return sendResponse(
    res,
    200,
    "Logged out Successfully"
  );
});

// =========================================================
// LOGOUT ALL
// =========================================================

const logoutAll = asyncHandler(async (req, res) => {
  await logoutAllService(req.user._id);

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return sendResponse(
    res,
    200,
    "Logged out from all devices."
  );
});

// =========================================================
// CURRENT USER
// =========================================================

const me = asyncHandler(async (req, res) => {
  return sendResponse(
    res,
    200,
    "Current user fetched Successfully.",
    req.user
  );
});

// =========================================================
// FORGOT PASSWORD
// =========================================================

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await forgotPasswordService(
    req.body.email
  );

  return sendResponse(
    res,
    200,
    result.message
  );
});

// =========================================================
// RESET PASSWORD
// =========================================================

const resetPassword = asyncHandler(async (req, res) => {
  const {
    email,
    otp,
    newPassword,
  } = req.body;

  const result = await resetPasswordService(
    email,
    otp,
    newPassword
  );

  return sendResponse(
    res,
    200,
    result.message
  );
});

// =========================================================
// SEND OTP
// =========================================================

const sendOTP = asyncHandler(async (req, res) => {
  const result = await sendOTPService(
    req.body.email
  );

  return sendResponse(
    res,
    200,
    result.message
  );
});

// =========================================================
// RESEND OTP
// =========================================================

const resendOTP = asyncHandler(async (req, res) => {
  const result = await resendOTPService(
    req.body.email
  );

  return sendResponse(
    res,
    200,
    result.message
  );
});

// =========================================================
// VERIFY OTP
// =========================================================

const verifyOTP = asyncHandler(async (req, res) => {
  const {
    email,
    otp,
  } = req.body;

  const result = await verifyOTPService(
    email,
    otp
  );

  return sendResponse(
    res,
    200,
    result.message
  );
});

// =========================================================
// VERIFY EMAIL
// =========================================================

const verifyEmail = asyncHandler(async (req, res) => {
  const {
    email,
    otp,
  } = req.body;

  const result = await verifyEmailService(
    email,
    otp
  );

  return sendResponse(
    res,
    200,
    result.message
  );
});

export {
  register,
  login,
  refreshToken,
  accessToken,
  logout,
  logoutAll,
  me,
  forgotPassword,
  resetPassword,
  sendOTP,
  resendOTP,
  verifyOTP,
  verifyEmail,
};
