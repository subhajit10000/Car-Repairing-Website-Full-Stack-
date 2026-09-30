import axios from "axios";
import { getAccessToken } from "../utils/storage.js";

// Matches backend/app.js: App.use("/api/v1/auth", authRouter)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// LoginForm/RegisterForm store the access token in localStorage/sessionStorage
// (see utils/storage.js). Attach it as a Bearer token so protected routes
// (booking, profile, etc.) authenticate — the backend's authMiddleware accepts
// either this header or an accessToken cookie.
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Backend sends errors as { success, message } or { errors: [{ message }] }
// (see backend/middlewares/validation.middleware.js) — normalize both here
// so every caller can just do `catch (err) { setError(err.message) }`.
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data;
    const message =
      data?.errors?.[0]?.message || data?.message || "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;
