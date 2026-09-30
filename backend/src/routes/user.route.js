import express from "express";
import { body } from "express-validator";
import { requestProfileUpdateOtp, confirmProfileUpdate, updateBasicProfile, uploadProfilePicture } from "../controllers/profile.controller.js";
import uploadImage from "../middlewares/upload.middleware.js";
import User from "../models/user.model.js";
import authorize from "../middlewares/role.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { passwordResetLimiter } from "../middlewares/rateLimiter.js";
import validate from "../middlewares/validation.middleware.js";

const router = express.Router();
router.use(authMiddleware);

router.patch("/profile", updateBasicProfile);
router.post("/profile/picture", uploadImage.single("image"), uploadProfilePicture);

// Admin-only user directory used when assigning workshop employees/managers.
router.get("/admin/directory", authorize("ADMIN"), async (req, res) => {
  const users = await User.find({ isBlocked: false }, "firstName lastName email phone role workshop profilePicture").sort({ firstName: 1, lastName: 1 });
  return res.json({ success: true, message: "Users fetched", data: users });
});

const requestOtpValidator = [
  body("field").isIn(["email", "phone"]).withMessage("field must be 'email' or 'phone'."),
  body("value").trim().notEmpty().withMessage("value is required."),
];

const confirmOtpValidator = [
  body("field").isIn(["email", "phone"]).withMessage("field must be 'email' or 'phone'."),
  body("otp").trim().notEmpty().withMessage("otp is required."),
];

// Feature 8: customer updates their email or phone, gated by OTP
// confirmation.
router.post(
  "/profile/request-otp",
  passwordResetLimiter,
  requestOtpValidator,
  validate,
  requestProfileUpdateOtp,
);

router.post(
  "/profile/confirm-update",
  passwordResetLimiter,
  confirmOtpValidator,
  validate,
  confirmProfileUpdate,
);

export default router;
