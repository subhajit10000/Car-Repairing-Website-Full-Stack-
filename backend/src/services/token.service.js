import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import { verifyRefreshToken } from "../utils/jwt.js";
import {
    createRefreshToken,
    findRefreshToken,
    deleteRefreshToken,
    deleteRefreshTokensByUser,
} from "../repositories/token.repository.js";
import { findUserById } from "../repositories/user.repository.js";


const issueTokenPair = async (user, req = {}) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    const decoded = jwt.decode(refreshToken);
    const expiredAt = new Date(decoded.exp * 1000);

    await createRefreshToken({
        user: user._id,
        token: refreshToken,
        expiredAt,
        userAgent: req.headers?.["user-agent"] || "",
        ipAddress: req.ip || "",
    });

    return { accessToken, refreshToken };
};


const rotateRefreshToken = async (refreshToken, req = {}) => {
    if (!refreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    const decoded = await verifyRefreshToken(refreshToken);

    const existing = await findRefreshToken(refreshToken);
    if (!existing) {
        throw new ApiError(401, "Session has been revoked. Please login again.");
    }

    const user = await findUserById(decoded.id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    if (user.isBlocked) {
        throw new ApiError(403, "Your account is blocked.");
    }

    await deleteRefreshToken(refreshToken);
    const tokens = await issueTokenPair(user, req);

    return { user, ...tokens };
};

// Revoke a single session (logout from this device only).
const revokeRefreshToken = async (refreshToken) => {
    if (!refreshToken) return;
    await deleteRefreshToken(refreshToken);
};

// Revoke every session for a user (logout from all devices).
const revokeAllRefreshTokens = async (userId) => {
    await deleteRefreshTokensByUser(userId);
};

export {
    issueTokenPair,
    rotateRefreshToken,
    revokeRefreshToken,
    revokeAllRefreshTokens,
};
