
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CarFront, ShieldCheck, CheckCircle2 } from "lucide-react";
import OtpStep from "./otpSubmit.jsx";
import { clearAuth, setAuthSession } from "../../utils/storage.js";

const API_URL = "http://localhost:5000";

const Register = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState("register");

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [verifyEmail, setVerifyEmail] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    const validatePassword = (password) => {
        return (
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[^A-Za-z0-9]/.test(password)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            confirmPassword,
        } = formData;

        if (
            !firstName.trim() ||
            !lastName.trim() ||
            !email.trim() ||
            !password
        ) {
            setError("Please fill in all required fields.");
            return;
        }

        if (firstName.trim().length < 2) {
            setError("First name must be at least 2 characters.");
            return;
        }

        if (lastName.trim().length < 2) {
            setError("Last name must be at least 2 characters.");
            return;
        }

        if (!validatePassword(password)) {
            setError(
                "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/api/v1/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        firstName: firstName.trim(),
                        lastName: lastName.trim(),
                        email: email.trim(),
                        ...(phone.trim() && { phone: phone.trim() }),
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                const validationMessage =
                    data?.errors?.[0]?.message ||
                    data?.message ||
                    "Registration failed. Please try again.";

                throw new Error(validationMessage);
            }

            // Registering a new account should never leave an old session's
            // token lying around (see utils/storage.js's setAuthSession for
            // why a leftover token causes a confusing "User not found" later).
            if (data?.data?.accessToken) {
                setAuthSession(data.data.accessToken, data?.data?.user);
            } else {
                clearAuth();
            }

            const registeredEmail = email.trim();

            setVerifyEmail(registeredEmail);

            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                password: "",
                confirmPassword: "",
            });

            setStep("verify");
        } catch (err) {
            setError(
                err.message ||
                    "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center px-4 py-24 sm:py-28">

            {/* Background Glow */}
            <div className="fixed top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/5 blur-3xl rounded-full pointer-events-none" />

            <div className="relative w-full max-w-5xl grid lg:grid-cols-2 overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-800/80 shadow-2xl shadow-black/30">

                {/* ================= LEFT PANEL ================= */}

                <div className="hidden lg:flex relative flex-col justify-between p-10 bg-linear-to-br from-zinc-800 via-zinc-900 to-black">

                    <div>
                        <Logo className="mb-12" />

                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />

                            <span className="text-xs font-bold uppercase tracking-widest text-yellow-500">
                                {step === "register"
                                    ? "Join Us"
                                    : "Secure Verification"}
                            </span>
                        </div>

                        <h1 className="mt-6 text-4xl xl:text-5xl font-black leading-tight">
                            {step === "register" ? (
                                <>
                                    Create your
                                    <span className="block text-yellow-500">
                                        account.
                                    </span>
                                </>
                            ) : (
                                <>
                                    Verify your
                                    <span className="block text-yellow-500">
                                        email.
                                    </span>
                                </>
                            )}
                        </h1>

                        <p className="mt-5 max-w-md text-zinc-400 leading-7">
                            {step === "register"
                                ? "Join Car Detailing and manage your vehicle services, appointments, service history and more from one convenient place."
                                : "We take account security seriously. Confirming your email helps keep your service history and bookings safe."}
                        </p>
                    </div>

                    {/* Features */}

                    <div className="space-y-5">

                        <Feature
                            number="01"
                            title="Easy Appointment Booking"
                            description="Book your vehicle service in just a few clicks."
                        />

                        <Feature
                            number="02"
                            title="Track Service History"
                            description="Keep all your vehicle service records organized."
                        />

                        <Feature
                            number="03"
                            title="Manage Your Vehicles"
                            description="Add and manage multiple vehicles from one account."
                        />

                    </div>
                </div>

                {/* ================= RIGHT PANEL ================= */}

                <div className="p-6 sm:p-10 lg:p-12">
                    <div className="mx-auto max-w-md">

                        {/* Mobile Logo */}

                        <Logo className="mb-8 lg:hidden" />

                        {step === "register" ? (
                            <>
                                {/* Header */}

                                <div className="mb-8">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-2 h-2 rounded-full bg-yellow-500" />

                                        <span className="text-xs font-bold uppercase tracking-widest text-yellow-500">
                                            Create Account
                                        </span>
                                    </div>

                                    <h2 className="text-3xl sm:text-4xl font-black">
                                        Get started
                                    </h2>

                                    <p className="mt-2 text-sm text-zinc-400">
                                        Enter your details to create your account.
                                    </p>
                                </div>

                                {/* Error */}

                                {error && (
                                    <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                        {error}
                                    </div>
                                )}

                                {/* Success */}

                                {success && (
                                    <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                                        {success}
                                    </div>
                                )}

                                {/* Form */}

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-5"
                                >

                                    {/* Names */}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        <InputField
                                            label="First Name"
                                            name="firstName"
                                            type="text"
                                            placeholder="John"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                        />

                                        <InputField
                                            label="Last Name"
                                            name="lastName"
                                            type="text"
                                            placeholder="Doe"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />

                                    </div>

                                    {/* Email */}

                                    <InputField
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />

                                    {/* Phone */}

                                    <InputField
                                        label="Phone Number"
                                        name="phone"
                                        type="tel"
                                        placeholder="+91 9876543210"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        optional
                                    />

                                    {/* Password */}

                                    <PasswordField
                                        label="Password"
                                        name="password"
                                        placeholder="Enter a strong password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        show={showPassword}
                                        setShow={setShowPassword}
                                    />

                                    {/* Confirm Password */}

                                    <PasswordField
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        show={showConfirmPassword}
                                        setShow={setShowConfirmPassword}
                                    />

                                    {/* Password Requirements */}

                                    <div className="rounded-2xl bg-zinc-900 border border-zinc-700 p-4">

                                        <div className="flex items-center gap-2 mb-3">
                                            <ShieldCheck className="w-4 h-4 text-yellow-500" />

                                            <p className="text-xs font-bold text-zinc-300">
                                                Password requirements
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">

                                            <PasswordRequirement
                                                active={formData.password.length >= 8}
                                                text="8+ characters"
                                            />

                                            <PasswordRequirement
                                                active={/[A-Z]/.test(formData.password)}
                                                text="Uppercase letter"
                                            />

                                            <PasswordRequirement
                                                active={/[a-z]/.test(formData.password)}
                                                text="Lowercase letter"
                                            />

                                            <PasswordRequirement
                                                active={/[0-9]/.test(formData.password)}
                                                text="Number"
                                            />

                                            <PasswordRequirement
                                                active={/[^A-Za-z0-9]/.test(formData.password)}
                                                text="Special character"
                                            />

                                        </div>
                                    </div>

                                    {/* Submit */}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="
                                            w-full
                                            rounded-xl
                                            bg-yellow-500
                                            px-5
                                            py-3.5
                                            font-bold
                                            text-black
                                            shadow-lg
                                            shadow-yellow-500/10
                                            transition-all
                                            duration-300
                                            hover:bg-yellow-400
                                            hover:shadow-yellow-500/20
                                            focus:outline-none
                                            focus:ring-2
                                            focus:ring-yellow-500
                                            focus:ring-offset-2
                                            focus:ring-offset-zinc-800
                                            disabled:cursor-not-allowed
                                            disabled:opacity-60
                                        "
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                                                Creating Account...
                                            </span>
                                        ) : (
                                            "Create Account"
                                        )}
                                    </button>
                                </form>

                                {/* Login */}

                                <p className="mt-7 text-center text-sm text-zinc-400">
                                    Already have an account?{" "}

                                    <Link
                                        to="/login"
                                        onClick={() =>
                                            window.scrollTo(0, 0)
                                        }
                                        className="font-bold text-yellow-500 hover:text-yellow-400 transition"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </>
                        ) : (
                            <OtpStep
                                email={verifyEmail}
                                onBack={() => {
                                    setStep("register");
                                    setError("");
                                    setSuccess("");
                                }}
                                onVerified={() => navigate("/login")}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


/* =========================================================
   LOGO
========================================================= */

const Logo = ({ className = "" }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div
                className="
                    flex
                    h-10
                    w-10
                    lg:h-11
                    lg:w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-yellow-500
                    shadow-lg
                    shadow-yellow-500/10
                "
            >
                <CarFront className="w-5 h-5 lg:w-6 lg:h-6 text-black" />
            </div>

            <span className="text-xl font-black tracking-tight text-white">
                Car Detailing
            </span>
        </div>
    );
};


/* =========================================================
   INPUT FIELD
========================================================= */

const InputField = ({
    label,
    name,
    type,
    placeholder,
    value,
    onChange,
    required,
    optional,
}) => {
    return (
        <div>
            <label
                htmlFor={name}
                className="mb-2 block text-sm font-semibold text-zinc-300"
            >
                {label}

                {optional && (
                    <span className="ml-1 text-xs text-zinc-500 font-normal">
                        (optional)
                    </span>
                )}
            </label>

            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                autoComplete="off"
                className="
                    w-full
                    rounded-xl
                    border
                    border-zinc-700
                    bg-zinc-900
                    px-4
                    py-3
                    text-sm
                    text-white
                    placeholder-zinc-600
                    outline-none
                    transition-all
                    duration-300
                    focus:border-yellow-500
                    focus:ring-2
                    focus:ring-yellow-500/10
                "
            />
        </div>
    );
};


/* =========================================================
   PASSWORD FIELD
========================================================= */

const PasswordField = ({
    label,
    name,
    placeholder,
    value,
    onChange,
    show,
    setShow,
}) => {
    return (
        <div>
            <label
                htmlFor={name}
                className="mb-2 block text-sm font-semibold text-zinc-300"
            >
                {label}
            </label>

            <div className="relative">
                <input
                    id={name}
                    name={name}
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required
                    autoComplete="new-password"
                    className="
                        w-full
                        rounded-xl
                        border
                        border-zinc-700
                        bg-zinc-900
                        px-4
                        py-3
                        pr-20
                        text-sm
                        text-white
                        placeholder-zinc-600
                        outline-none
                        transition-all
                        duration-300
                        focus:border-yellow-500
                        focus:ring-2
                        focus:ring-yellow-500/10
                    "
                />

                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-xs
                        font-bold
                        text-zinc-500
                        hover:text-yellow-500
                        transition
                    "
                >
                    {show ? "Hide" : "Show"}
                </button>
            </div>
        </div>
    );
};


/* =========================================================
   PASSWORD REQUIREMENT
========================================================= */

const PasswordRequirement = ({ active, text }) => {
    return (
        <div
            className={`flex items-center gap-2 ${
                active
                    ? "text-green-400"
                    : "text-zinc-500"
            }`}
        >
            {active ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
                <span className="w-3.5 text-center">
                    ○
                </span>
            )}

            <span>{text}</span>
        </div>
    );
};


/* =========================================================
   FEATURE
========================================================= */

const Feature = ({ number, title, description }) => {
    return (
        <div className="flex gap-4">

            <div
                className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-yellow-500/10
                    border
                    border-yellow-500/20
                    text-xs
                    font-bold
                    text-yellow-500
                "
            >
                {number}
            </div>

            <div>
                <h3 className="text-sm font-bold text-zinc-200">
                    {title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default Register;
