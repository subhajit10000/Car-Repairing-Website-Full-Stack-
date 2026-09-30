
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  CarFront,
  ShieldCheck,
  Wrench,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import Button from "../ui/Button.jsx";
import { setAuthSession } from "../../utils/storage.js";

const API_URL = "http://localhost:5000";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
    role: "CUSTOMER",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const { email, password, remember } = formData;

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const validationMessage =
          data?.errors?.[0]?.message ||
          data?.message ||
          "Login failed. Please try again.";

        throw new Error(validationMessage);
      }

      /*
       * Expected backend response:
       *
       * data: {
       *   accessToken: "...",
       *   user: {
       *     firstName: "...",
       *     lastName: "...",
       *     email: "...",
       *     role: "admin" / "customer"
       *   }
       * }
       */

      const { accessToken, user } = data?.data || {};

      if (!user) {
        throw new Error("User information was not returned by the server.");
      }

      if (!user.role) {
        throw new Error("User role was not returned by the server.");
      }

      // Store login information. Always clears out any stale token from a
      // previous session first (see utils/storage.js) so an old, no-longer-
      // valid account can't linger and break later requests.
      setAuthSession(accessToken, user, remember);

      /*
       * ROLE-BASED NAVIGATION
       */
      const role = user.role.toUpperCase();
      const dashboards = {
        ADMIN: "/admin-dashboard",
        CUSTOMER: "/customer-dashboard",
        WORKSHOP_MANAGER: "/manager-dashboard",
        SERVICE_ADVISOR: "/service-advisor-dashboard",
        MECHANIC: "/mechanic-dashboard",
      };
      navigate(dashboards[role] || "/profile");
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center px-4 py-10 pt-24 relative overflow-hidden">

      {/* Background Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />

      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />

      {/* Main Container */}
      <div className="relative w-full max-w-6xl grid lg:grid-cols-2 bg-zinc-800/60 border border-zinc-700/70 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">

        {/* LEFT SIDE */}
        <div className="hidden lg:flex relative flex-col justify-between p-10 xl:p-14 bg-zinc-900 overflow-hidden">

          <div className="absolute -top-32 -left-32 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl" />

          <div className="absolute bottom-0 right-0 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl" />

          <div className="absolute top-0 right-0 w-40 h-40 border-r border-t border-yellow-500/10 rounded-tr-3xl" />

          <div className="absolute bottom-0 left-0 w-40 h-40 border-l border-b border-yellow-500/10 rounded-bl-3xl" />

          <div className="relative z-10">

            {/* Brand */}
            <Link to="/" className="inline-flex items-center gap-3 mb-16">

              <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <CarFront className="w-6 h-6 text-zinc-950" />
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  Car<span className="text-yellow-500">Detailing</span>
                </h2>

                <p className="text-xs text-zinc-500">
                  Professional Auto Care
                </p>
              </div>

            </Link>

            {/* Main Message */}
            <div className="max-w-lg">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-500 text-xs font-semibold mb-6">

                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />

                YOUR CAR. OUR PASSION.

              </div>

              <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">

                Welcome back to

                <span className="block text-yellow-500 mt-1">
                  Car Detailing.
                </span>

              </h1>

              <p className="mt-6 text-zinc-400 leading-relaxed max-w-md">
                Manage your appointments, track vehicle services, and keep
                your car in perfect condition with our professional workshop
                platform.
              </p>

            </div>

            {/* Features */}
            <div className="mt-10 space-y-4">

              <div className="flex items-center gap-4">

                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-yellow-500" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">
                    Trusted Auto Care
                  </h3>

                  <p className="text-xs text-zinc-500 mt-0.5">
                    Professional service for your vehicle
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-4">

                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/10 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-yellow-500" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">
                    Expert Mechanics
                  </h3>

                  <p className="text-xs text-zinc-500 mt-0.5">
                    Skilled technicians for every repair
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-4">

                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/10 flex items-center justify-center">
                  <Clock3 className="w-5 h-5 text-yellow-500" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">
                    Easy Appointment
                  </h3>

                  <p className="text-xs text-zinc-500 mt-0.5">
                    Book and manage services effortlessly
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* Bottom */}
          <div className="relative z-10 flex items-center gap-2 mt-12 text-xs text-zinc-600">

            <CheckCircle2 className="w-4 h-4 text-yellow-500" />

            Reliable service. Better driving experience.

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="p-7 sm:p-10 lg:p-12 bg-zinc-800/50">

          {/* Mobile Logo */}
          <div className="flex lg:hidden justify-center mb-8">

            <Link to="/" className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <CarFront className="w-6 h-6 text-zinc-950" />
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Car<span className="text-yellow-500">Detailing</span>
                </h2>

                <p className="text-[10px] text-zinc-500">
                  Professional Auto Care
                </p>
              </div>

            </Link>

          </div>

          {/* Heading */}
          <div className="mb-8">

            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-5">
              <Lock className="w-5 h-5 text-yellow-500" />
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white">
              Welcome Back
            </h2>

            <p className="text-zinc-400 mt-2 text-sm">
              Sign in to continue to your account
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>

              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Email Address
              </label>

              <div className="relative">

                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 hover:border-zinc-600"
                />

              </div>

            </div>

            {/* Login role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-zinc-300 mb-2">Login as</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl py-3.5 px-4 text-white outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20">
                <option value="CUSTOMER">Login as Customer</option>
                <option value="WORKSHOP_MANAGER">Login as Workshop Manager</option>
                <option value="ADMIN">Login as Admin</option>
                <option value="MECHANIC">Login as Mechanic</option>
                <option value="SERVICE_ADVISOR">Login as Service Advisor</option>
              </select>
            </div>

            {/* Password */}
            <div>

              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Password
              </label>

              <div className="relative">

                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 hover:border-zinc-600"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-yellow-500 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>

              </div>

            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between gap-4">

              <label className="flex items-center gap-2 cursor-pointer">

                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="w-4 h-4 accent-yellow-500 rounded"
                />

                <span className="text-sm text-zinc-400">
                  Remember me
                </span>

              </label>

              <Link
                to="/forgot-password"
                className="text-sm text-yellow-500 hover:text-yellow-400 transition font-medium"
              >
                Forgot password?
              </Link>

            </div>

            {/* Login Button */}
            <Button type="submit" disabled={loading}>

              {loading ? (
                <span className="flex items-center justify-center gap-2">

                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-900/30 border-t-zinc-950" />

                  Signing In...

                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}

            </Button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">

            <div className="h-px bg-zinc-700 flex-1" />

            <span className="text-xs text-zinc-600 font-medium">
              OR
            </span>

            <div className="h-px bg-zinc-700 flex-1" />

          </div>

          {/* Google */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-zinc-700 bg-zinc-900/70 hover:bg-zinc-900 hover:border-zinc-600 text-white font-medium py-3.5 rounded-xl transition"
          >
            <span className="text-lg font-bold text-yellow-500">
              G
            </span>

            Continue with Google
          </button>

          {/* Register */}
          <p className="text-center text-sm text-zinc-500 mt-7">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="text-yellow-500 hover:text-yellow-400 font-semibold transition"
            >
              Create account
            </Link>

          </p>

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-zinc-700/70">

            <div className="flex items-center justify-center gap-2 text-xs text-zinc-600">

              <ShieldCheck className="w-4 h-4 text-yellow-500/70" />

              Your account information is securely protected

            </div>

          </div>

        </div>
      </div>

      {/* Copyright */}
      <p className="absolute bottom-3 left-0 right-0 text-center text-[11px] text-zinc-700">
        &copy; {new Date().getFullYear()} Car Detailing. All rights reserved.
      </p>

    </div>
  );
};

export default Login;
