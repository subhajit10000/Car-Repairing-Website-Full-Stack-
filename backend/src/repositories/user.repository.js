
import User from "../models/user.model.js";

const createUser = async (userData) => {
    return await User.create(userData);
}

const findUserByEmail = async (email) => {
    return await User.findOne({ email }).select("+password");
}

// Login uses findUserByEmail (needs +password). OTP flows need the OTP
// fields too, which are select:false by default.
const findUserByEmailWithOTP = async (email) => {
    return await User.findOne({ email }).select("+otp +otpExpiry +otpPurpose");
}

const findUserById = async (id) => {
    return await User.findById(id);
}

const findAllUsers = async () => {
  return await User.find({})
    .select("-password")
    .sort({ createdAt: -1 });
};

// changePasswordService needs the current hashed password to compare against.
const findUserByIdWithPassword = async (id) => {
    return await User.findById(id).select("+password");
}

const updateUser = async (id, data) => {
    return await User.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
    })
};

const deleteUser = async (id) => {
    return await User.findByIdAndDelete(id);
}

export {
    createUser,
    findUserByEmail,
    findUserByEmailWithOTP,
    findUserById,
    findUserByIdWithPassword,
    updateUser,
    deleteUser,
    findAllUsers
}

