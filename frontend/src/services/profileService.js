import axiosInstance from "../api/axiosInstance.js";

// Matches backend/routes/user.route.js, mounted at /api/v1/users.
// Feature 8: change email/phone gated by an OTP sent to the account's
// current, verified email.
const profileService = {
  requestUpdateOtp: async (field, value) => {
    const response = await axiosInstance.post("/users/profile/request-otp", { field, value });
    return response.data;
  },

  confirmUpdate: async (field, otp) => {
    const response = await axiosInstance.post("/users/profile/confirm-update", { field, otp });
    return response.data;
  },
};

export default profileService;
