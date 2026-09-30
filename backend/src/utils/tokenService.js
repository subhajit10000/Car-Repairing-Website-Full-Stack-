import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

// Matches "7d" / "15m" / "30s" style expiry strings and converts to ms.
const expiryToMs = (expiry) => {
    const match = /^(\d+)([smhd])$/.exec(expiry);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // fallback: 7 days
    const value = Number(match[1]);
    const unit = match[2];
    const unitMs = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
    return value * unitMs[unit];
};

const signAccessToken = (userId) =>
    jwt.sign({ id: userId, type: "access" }, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });

const signRefreshToken = (userId) =>
    jwt.sign(
        { id: userId, type: "refresh", jti: crypto.randomUUID() },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

const verifyAccessToken = (token) => jwt.verify(token, ACCESS_TOKEN_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_TOKEN_SECRET);

// Refresh tokens are stored server-side only as a SHA-256 hash, so a leaked
// DB never exposes usable tokens.
const hashToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");

const refreshTokenExpiryDate = () =>
    new Date(Date.now() + expiryToMs(REFRESH_TOKEN_EXPIRY));

/**
 * Issues a fresh access + refresh token pair for a user, storing the
 * refresh token's hash on the user document (multi-device: one entry
 * per active session) and pruning any expired sessions while we're at it.
 */
const issueTokenPair = async (user) => {
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    const now = new Date();
    user.refreshTokens = (user.refreshTokens || []).filter(
        (entry) => entry.expiresAt > now
    );
    user.refreshTokens.push({
        tokenHash: hashToken(refreshToken),
        expiresAt: refreshTokenExpiryDate(),
        createdAt: now,
    });
    await user.save();

    return { accessToken, refreshToken };
};

// Cookie options for the httpOnly refresh-token cookie.
const refreshCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: expiryToMs(REFRESH_TOKEN_EXPIRY),
    path: "/api/auth",
});

export default {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    hashToken,
    issueTokenPair,
    refreshCookieOptions,
    refreshTokenExpiryDate,
};
