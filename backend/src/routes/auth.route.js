import express from "express";
import {
  login,
  logout,
//   logoutAll,
//   me,
//   refreshToken,
//   accessToken,
  register,
  forgotPassword,
  resetPassword,
  sendOTP,
  resendOTP,
  verifyOTP,
  verifyEmail,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  apiLimiter,
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
} from "../middlewares/rateLimiter.js";
import logger from "../utils/logger.js";
import {
  loginValidator,
  registerValidator,
} from "../validators/auth.validator.js";
import validate from "../middlewares/validation.middleware.js";

const router = express.Router();

// 1. Router-level logging middleware (logs all incoming hits to /api/v1/auth/*)
router.use((req, res, next) => {
  logger.info(`[Auth Router] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// 2. Specialized route logger helper for specific endpoints
const logRoute = (routeName) => (req, res, next) => {
  logger.info(`[Auth Router] Executing ${routeName} route handler`);
  next();
};

// validators are yet to implement

// Route Definitions
router.post(
  "/register",
  registerLimiter,
  logRoute("Register"),
  registerValidator,
  validate,
  register,
);

router.post(
  "/login",
  loginLimiter,
  logRoute("login"),
  loginValidator,
  validate,
  login,
);

// router.post("/refresh", refreshToken);

// router.post("/access-token", accessToken);

router.post("/logout", authMiddleware, logout);

// router.post("/logout-all", authMiddleware, logoutAll);

// router.get("/me", authMiddleware, me);

router.post(
  "/forgot-password",
  passwordResetLimiter,
  logRoute("forgotPassword"),
  forgotPassword,
);

router.post(
  "/reset-password",
  passwordResetLimiter,
  logRoute("resetPassword"),
  resetPassword,
);

router.post("/send-otp", logRoute("sendOTP"), sendOTP);

router.post("/resend-otp", logRoute("resendOTP"), resendOTP);

router.post("/verify-otp", logRoute("verifyOTP"), verifyOTP);

router.post("/verify-email", logRoute("verifyEmail"), verifyEmail);

export default router;
