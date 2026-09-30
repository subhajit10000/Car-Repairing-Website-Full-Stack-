
import { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  Mail,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

const API_URL = "http://localhost:5000";
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

const OtpStep = ({ email, onBack, onVerified }) => {
  const [digits, setDigits] = useState(
    Array(OTP_LENGTH).fill("")
  );
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [verified, setVerified] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(
      () => setCooldown((c) => c - 1),
      1000
    );

    return () => clearTimeout(timer);
  }, [cooldown]);

  const focusInput = (index) => {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  };

  const handleDigitChange = (index, rawValue) => {
    const value = rawValue.replace(/\D/g, "");

    setOtpError("");

    if (!value) {
      setDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    // Paste multiple digits
    if (value.length > 1) {
      const chars = value
        .slice(0, OTP_LENGTH - index)
        .split("");

      setDigits((prev) => {
        const next = [...prev];

        chars.forEach((char, i) => {
          next[index + i] = char;
        });

        return next;
      });

      const nextIndex = Math.min(
        index + chars.length,
        OTP_LENGTH - 1
      );

      focusInput(nextIndex);
      return;
    }

    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

    if (index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (
      e.key === "Backspace" &&
      !digits[index] &&
      index > 0
    ) {
      focusInput(index - 1);
    }

    if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    }

    if (
      e.key === "ArrowRight" &&
      index < OTP_LENGTH - 1
    ) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "");

    if (!pasted) return;

    e.preventDefault();
    handleDigitChange(0, pasted);
  };

  // Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();

    const code = digits.join("");

    setOtpError("");
    setOtpSuccess("");

    if (code.length !== OTP_LENGTH) {
      setOtpError(
        `Please enter the complete ${OTP_LENGTH}-digit code.`
      );
      return;
    }

    try {
      setVerifying(true);

      const response = await fetch(
        `${API_URL}/api/v1/auth/verify-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            otp: code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const message =
          data?.errors?.[0]?.message ||
          data?.message ||
          "Verification failed. Please try again.";

        throw new Error(message);
      }

      setOtpSuccess(
        data?.message ||
          "Email verified successfully!"
      );

      setVerified(true);

      setTimeout(() => {
        onVerified();
      }, 1200);
    } catch (err) {
      setOtpError(
        err.message ||
          "Something went wrong. Please try again."
      );

      setDigits(Array(OTP_LENGTH).fill(""));
      focusInput(0);
    } finally {
      setVerifying(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setOtpError("");
    setOtpSuccess("");

    try {
      setResending(true);

      const response = await fetch(
        `${API_URL}/api/v1/auth/resend-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Couldn't resend the code. Please try again."
        );
      }

      setOtpSuccess(
        data?.message ||
          "A new code has been sent to your email."
      );

      setDigits(Array(OTP_LENGTH).fill(""));
      focusInput(0);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setOtpError(
        err.message ||
          "Couldn't resend the code. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full">

      {/* Header */}
      <div className="text-center mb-7">

        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
          <ShieldCheck className="h-7 w-7 text-yellow-500" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Verify your email
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Enter the {OTP_LENGTH}-digit code sent to
        </p>

        <div className="mt-1 flex items-center justify-center gap-1.5 text-sm font-medium text-yellow-500 break-all">
          <Mail className="w-4 h-4 shrink-0" />
          <span>{email}</span>
        </div>

      </div>

      {/* Error */}
      {otpError && (
        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {otpError}
        </div>
      )}

      {/* Success */}
      {otpSuccess && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{otpSuccess}</span>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleVerify}
        className="space-y-6"
      >

        {/* OTP Inputs */}
        <div
          className="flex justify-center gap-2 sm:gap-3"
          onPaste={handlePaste}
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) =>
                (inputRefs.current[index] = el)
              }
              type="text"
              inputMode="numeric"
              maxLength={OTP_LENGTH}
              value={digit}
              disabled={verified}
              onChange={(e) =>
                handleDigitChange(
                  index,
                  e.target.value
                )
              }
              onKeyDown={(e) =>
                handleKeyDown(index, e)
              }
              className="
                h-12 w-10
                sm:h-14 sm:w-12
                rounded-xl
                border border-zinc-700
                bg-zinc-900
                text-center
                text-lg
                font-semibold
                text-white
                outline-none
                transition-all
                focus:border-yellow-500
                focus:ring-2
                focus:ring-yellow-500/20
                hover:border-zinc-600
                disabled:opacity-50
              "
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          type="submit"
          disabled={verifying || verified}
          className="
            w-full
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-yellow-500
            px-5
            py-3.5
            font-semibold
            text-zinc-950
            transition-all
            hover:bg-yellow-400
            hover:shadow-lg
            hover:shadow-yellow-500/10
            focus:outline-none
            focus:ring-2
            focus:ring-yellow-500/30
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {verifying ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950" />
              Verifying...
            </>
          ) : verified ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Verified — redirecting...
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              Verify Email
            </>
          )}
        </button>
      </form>

      {/* Bottom Actions */}
      <div className="mt-6 flex items-center justify-between">

        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-yellow-500 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          className="text-sm font-semibold text-yellow-500 hover:text-yellow-400 transition disabled:cursor-not-allowed disabled:text-zinc-600"
        >
          {resending
            ? "Sending..."
            : cooldown > 0
            ? `Resend in ${cooldown}s`
            : "Resend code"}
        </button>

      </div>

      {/* Security Note */}
      <div className="mt-7 pt-5 border-t border-zinc-700/70">
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-600">
          <ShieldCheck className="w-4 h-4 text-yellow-500/70" />
          Your verification is secure and protected
        </div>
      </div>

    </div>
  );
};

export default OtpStep;
