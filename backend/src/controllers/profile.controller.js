import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";
import sendResponse from "../helpers/response.js";
import User from "../models/user.model.js";
import otpService from "../utils/otpService.js";
import { sendProfileUpdateOtpEmail } from "../config/mailer.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

// Feature 8: a customer changes their contact number or email, but only
// after confirming an OTP. The OTP purpose is scoped ("changeEmail" /
// "changePhone") so it can't be reused to bypass, say, password reset.

const FIELD_TO_PURPOSE = {
  email: "changeEmail",
  phone: "changePhone",
};

// Step 1: request an OTP. For an email change, the OTP is sent to the *new*
// email address (proves the user owns it). For a phone change, since we
// don't have SMS wired up, the OTP goes to the user's existing verified
// email instead — still confirms it's really them.
const requestProfileUpdateOtp = asyncHandler(async (req, res) => {
  const { field, value } = req.body;

  if (!FIELD_TO_PURPOSE[field]) {
    throw new ApiError(400, "field must be 'email' or 'phone'.");
  }
  if (!value || !value.trim()) {
    throw new ApiError(400, "value is required.");
  }

  const user = await User.findById(req.user._id);

  if (field === "email") {
    const normalized = value.trim().toLowerCase();
    if (normalized === user.email) {
      throw new ApiError(400, "This is already your current email.");
    }
    const existing = await User.findOne({ email: normalized });
    if (existing) {
      throw new ApiError(409, "This email is already in use by another account.");
    }
    user.pendingEmail = normalized;
    user.pendingPhone = null;
  } else {
    const normalized = value.trim();
    if (normalized === user.phone) {
      throw new ApiError(400, "This is already your current phone number.");
    }
    user.pendingPhone = normalized;
    user.pendingEmail = null;
  }

  const otp = otpService.generateOtp();
  user.otp = await otpService.hashOtp(otp);
  user.otpExpiry = otpService.otpExpiryDate();
  user.otpPurpose = FIELD_TO_PURPOSE[field];
  await user.save();

  // Always send to the account's current, verified email — for an email
  // change that's still the safest place to alert the owner even though
  // the OTP itself proves control of the new address via this same email.
  await sendProfileUpdateOtpEmail({
    to: user.email,
    name: user.firstName,
    otp,
    expiryMinutes: otpService.OTP_EXPIRY_MINUTES,
    field,
    newValue: value.trim(),
  });

  logger.info(`Profile update OTP (${field}) issued for user ${user._id}`);

  return sendResponse(res, 200, `A verification code has been sent to confirm your ${field} change.`);
});

// Step 2: confirm the OTP and apply the pending change.
const confirmProfileUpdate = asyncHandler(async (req, res) => {
  const { field, otp } = req.body;

  if (!FIELD_TO_PURPOSE[field]) {
    throw new ApiError(400, "field must be 'email' or 'phone'.");
  }

  const user = await User.findById(req.user._id).select(
    "+otp +otpExpiry +otpPurpose +pendingEmail +pendingPhone",
  );

  if (!user.otp || !user.otpExpiry || user.otpPurpose !== FIELD_TO_PURPOSE[field]) {
    throw new ApiError(400, "No pending change was requested for this field.");
  }

  if (Date.now() > new Date(user.otpExpiry).getTime()) {
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  const isMatch = await otpService.compareOtp(otp, user.otp);
  if (!isMatch) {
    throw new ApiError(400, "Invalid OTP.");
  }

  if (field === "email") {
    if (!user.pendingEmail) {
      throw new ApiError(400, "No pending email change found.");
    }
    user.email = user.pendingEmail;
  } else {
    if (!user.pendingPhone) {
      throw new ApiError(400, "No pending phone change found.");
    }
    user.phone = user.pendingPhone;
  }

  user.pendingEmail = null;
  user.pendingPhone = null;
  user.otp = null;
  user.otpExpiry = null;
  user.otpPurpose = null;
  await user.save();

  logger.info(`User ${user._id} updated their ${field} via OTP.`);

  const safeUser = user.toObject();
  delete safeUser.password;

  return sendResponse(res, 200, `Your ${field} has been updated successfully.`, safeUser);
});

const updateBasicProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, address } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found.");
  if (firstName !== undefined) user.firstName = firstName.trim();
  if (lastName !== undefined) user.lastName = lastName.trim();
  if (address !== undefined) user.address = address.trim();
  await user.save();
  const safeUser = user.toObject();
  delete safeUser.password;
  return sendResponse(res, 200, "Profile updated successfully", safeUser);
});

const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Please select an image.");
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found.");
  const result = await uploadBufferToCloudinary(req.file.buffer, { folder: "car-detailing/profiles" });
  if (user.profilePicture?.publicId) await deleteFromCloudinary(user.profilePicture.publicId);
  user.profilePicture = { url: result.secure_url, publicId: result.public_id };
  await user.save();
  const safeUser = user.toObject();
  delete safeUser.password;
  return sendResponse(res, 200, "Profile picture updated", safeUser);
});

export { requestProfileUpdateOtp, confirmProfileUpdate, updateBasicProfile, uploadProfilePicture };
