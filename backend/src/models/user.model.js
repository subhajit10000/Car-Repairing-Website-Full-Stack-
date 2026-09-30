import mongoose from "mongoose";
import bcrypt from "bcryptjs";
// import validator from "validator";

import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    //   validate: [validator.isEmail, "Invalid Email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    phone: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
    profilePicture: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    role: {
      type: String,
      enum: [
        "CUSTOMER",
        "ADMIN",
        "WORKSHOP_MANAGER",
        "SERVICE_ADVISOR",
        "MECHANIC",
        ],
      default: "CUSTOMER",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },

    // Set for WORKSHOP_MANAGER, SERVICE_ADVISOR and MECHANIC users to scope
    // them to a single workshop. A WORKSHOP_MANAGER can only manage
    // services/employees/inventory for this workshop (see
    // middlewares/workshopOwnership.middleware.js).
    workshop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workshop",
      default: null,
      index: true,
    },

    otp: {
      type: String,
      select: false,
      default: null,
    },
    otpExpiry: {
      type: Date,
      select: false,
      default: null,
    },
    otpPurpose: {
      type: String,
    //   enum: ["verifyEmail", "resetPassword", "changeEmail", "changePhone", null],
      select: false,
      default: null,
    },

    // Holds the new email/phone value while an OTP-based profile-update
    // request is pending (see controllers/profile.controller.js). Cleared
    // once the OTP is confirmed or expires.
    pendingEmail: {
      type: String,
      select: false,
      default: null,
    },
    pendingPhone: {
      type: String,
      select: false,
      default: null,
    },

    lastLogin: Date,
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return generateAccessToken(this);
};

userSchema.methods.generateRefreshToken = function () {
  return generateRefreshToken(this);
};

const User = mongoose.model("User", userSchema);

export default User;
